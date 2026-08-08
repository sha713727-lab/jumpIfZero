import type { IncomingMessage, ServerResponse } from "node:http";
import type { Actor } from "@jumpifzero/contracts";
import { env } from "../config/env.ts";
import { newCorrelationId } from "../lib/crypto.ts";

export type HmacClaim = {
  readonly subjectId: string;
  readonly role: "admin" | "client" | "employee" | "gateway";
  readonly employeeKind: "delivery" | "sales" | null;
};

export type RequestContext = {
  readonly req: IncomingMessage;
  readonly res: ServerResponse;
  readonly abortController: AbortController;
  correlationId: string;
  rawBody: Buffer;
  bodyText: string;
  hmacClaim: HmacClaim | null;
  isGateway: boolean;
  actor: Actor | null;
  routeKey: string;
  pathParams: Record<string, string>;
  readonly startedAt: number;
};

export type Middleware = (ctx: RequestContext) => Promise<void>;

export function createRequestContext(
  req: IncomingMessage,
  res: ServerResponse,
): RequestContext {
  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    abortController.abort();
    req.destroy();
  }, env.REQUEST_TIMEOUT_MS);

  const clear = (): void => {
    clearTimeout(timeout);
  };

  res.on("close", clear);
  abortController.signal.addEventListener("abort", clear, { once: true });

  return {
    req,
    res,
    abortController,
    correlationId: newCorrelationId(),
    rawBody: Buffer.alloc(0),
    bodyText: "",
    hmacClaim: null,
    isGateway: false,
    actor: null,
    routeKey: "",
    pathParams: {},
    startedAt: Date.now(),
  };
}
