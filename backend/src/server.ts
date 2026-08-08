import http from "node:http";
import { env } from "./config/env.ts";
import { closePool } from "./db/pool.ts";
import {
  AppError,
  InternalError,
  MethodNotAllowedError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "./lib/errors.ts";
import {
  sendError,
  sendJson,
  sendNoContent,
  successEnvelope,
} from "./lib/http.ts";
import { logger } from "./lib/logger.ts";
import { recordHttpRequest } from "./lib/metrics.ts";
import { startOpenTelemetry } from "./lib/otel.ts";
import { closeRedis } from "./lib/redis.ts";
import { captureException, startSentry } from "./lib/sentry.ts";
import { parseJsonBody, parseWithSchema } from "./api/_helpers.ts";
import { assignCorrelationId } from "./middleware/correlationId.ts";
import { readBodyWithCap } from "./middleware/body.ts";
import { createRequestContext } from "./middleware/context.ts";
import { runMiddleware } from "./middleware/compose.ts";
import { verifyHmac } from "./middleware/hmac.ts";
import { resolveActor } from "./middleware/resolveActor.ts";
import { rateLimit } from "./middleware/rateLimit.ts";
import { matchRoute } from "./router.ts";
import { routes } from "./routes.ts";
import { tryHandleOpenApiDocs } from "./lib/swagger.ts";

function searchParamsToObject(
  params: URLSearchParams,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of params.keys()) {
    const value = params.get(key);
    if (value !== null) {
      out[key] = value;
    }
  }
  return out;
}

async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `http://${host}`);

  if (tryHandleOpenApiDocs(req, res, url, routes)) {
    return;
  }

  const ctx = createRequestContext(req, res);

  try {
    await runMiddleware(
      [assignCorrelationId, readBodyWithCap, verifyHmac, resolveActor],
      ctx,
    );

    const matched = matchRoute(routes, req.method ?? "GET", url.pathname);

    if (matched.type === "not_found") {
      throw new NotFoundError();
    }
    if (matched.type === "method_not_allowed") {
      res.setHeader("Allow", matched.allow.join(", "));
      throw new MethodNotAllowedError();
    }

    ctx.routeKey = matched.match.route.routeKey;
    ctx.pathParams = matched.match.params;

    await rateLimit(ctx);

    const routeModule = matched.match.route.module;
    const rawQuery = searchParamsToObject(url.searchParams);
    const contentTypeHeader = req.headers["content-type"];
    const contentType =
      typeof contentTypeHeader === "string"
        ? contentTypeHeader
        : Array.isArray(contentTypeHeader)
          ? (contentTypeHeader[0] ?? "")
          : "";
    const isMultipart = contentType.toLowerCase().includes("multipart/form-data");
    const rawBody =
      req.method === "GET" || req.method === "HEAD" || isMultipart
        ? null
        : parseJsonBody(ctx);

    if (routeModule.schema.params) {
      parseWithSchema(
        routeModule.schema.params,
        matched.match.params,
        "params",
      );
    }
    const query = routeModule.schema.query
      ? parseWithSchema(routeModule.schema.query, rawQuery, "query")
      : rawQuery;
    const body = routeModule.schema.body
      ? parseWithSchema(routeModule.schema.body, rawBody, "body")
      : rawBody;

    const data = await routeModule.default({
      ctx,
      params: matched.match.params,
      query,
      body,
    });

    if (res.writableEnded || res.headersSent) {
      const durationMs = Date.now() - ctx.startedAt;
      recordHttpRequest({ status: res.statusCode, durationMs });
      logger.info({
        msg: "request completed",
        correlationId: ctx.correlationId,
        route: ctx.routeKey,
        ...(ctx.actor ? { subjectId: ctx.actor.subjectId } : {}),
        durationMs,
        status: res.statusCode,
      });
      return;
    }

    let output: unknown;
    try {
      output = parseWithSchema(routeModule.schema.output, data, "output");
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new InternalError("Response failed output validation", err);
      }
      throw err;
    }

    const durationMs = Date.now() - ctx.startedAt;

    if (req.method === "DELETE" || output === null) {
      recordHttpRequest({ status: 204, durationMs });
      logger.info({
        msg: "request completed",
        correlationId: ctx.correlationId,
        route: ctx.routeKey,
        ...(ctx.actor ? { subjectId: ctx.actor.subjectId } : {}),
        durationMs,
        status: 204,
      });
      sendNoContent(res);
      return;
    }

    const hasCreateId =
      typeof output === "object" &&
      output !== null &&
      "id" in output &&
      typeof (output as { id: unknown }).id === "string";

    const status =
      req.method === "POST" &&
      hasCreateId &&
      ctx.routeKey.endsWith(".create")
        ? 201
        : 200;
    if (status === 201) {
      res.setHeader(
        "Location",
        `${url.pathname.replace(/\/$/, "")}/${(output as { id: string }).id}`,
      );
    }

    recordHttpRequest({ status, durationMs });
    logger.info({
      msg: "request completed",
      correlationId: ctx.correlationId,
      route: ctx.routeKey,
      ...(ctx.actor ? { subjectId: ctx.actor.subjectId } : {}),
      durationMs,
      status,
    });

    sendJson(res, status, successEnvelope(output, ctx.correlationId));
  } catch (error) {
    const status =
      error instanceof AppError
        ? error.status
        : 500;

    if (error instanceof RateLimitError) {
      res.setHeader("Retry-After", String(error.retryAfterSeconds));
    }

    recordHttpRequest({
      status,
      durationMs: Date.now() - ctx.startedAt,
      rateLimited: error instanceof RateLimitError,
    });

    if (status >= 500) {
      void captureException(error);
      logger.error({
        msg: "request failed",
        correlationId: ctx.correlationId,
        route: ctx.routeKey || "unresolved",
        ...(ctx.actor ? { subjectId: ctx.actor.subjectId } : {}),
        durationMs: Date.now() - ctx.startedAt,
        status,
        err: error,
      });
    } else {
      logger.warn({
        msg: "request rejected",
        correlationId: ctx.correlationId,
        route: ctx.routeKey || "unresolved",
        ...(ctx.actor ? { subjectId: ctx.actor.subjectId } : {}),
        durationMs: Date.now() - ctx.startedAt,
        status,
      });
    }

    sendError(res, error, ctx.correlationId);
  }
}

const server = http.createServer((req, res) => {
  void handleRequest(req, res);
});

await startOpenTelemetry();
await startSentry();

server.listen(env.PORT, env.HOST, () => {
  logger.info({
    msg: "backend listening",
    route: `${env.HOST}:${env.PORT}`,
  });
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ msg: "shutdown started", route: signal });
  const forceTimer = setTimeout(() => {
    logger.error({ msg: "shutdown drain exceeded", route: signal });
    process.exit(1);
  }, env.SHUTDOWN_DRAIN_MS);
  forceTimer.unref();

  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
  await closeRedis();
  await closePool();
  clearTimeout(forceTimer);
  logger.info({ msg: "shutdown complete", route: signal });
  process.exit(0);
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM").catch((err: unknown) => {
    logger.error({ msg: "shutdown failed", err });
    process.exit(1);
  });
});

process.on("SIGINT", () => {
  void shutdown("SIGINT").catch((err: unknown) => {
    logger.error({ msg: "shutdown failed", err });
    process.exit(1);
  });
});

process.on("unhandledRejection", (err: unknown) => {
  logger.error({ msg: "unhandled rejection", err });
  process.exit(1);
});

process.on("uncaughtException", (err: unknown) => {
  logger.error({ msg: "uncaught exception", err });
  process.exit(1);
});
