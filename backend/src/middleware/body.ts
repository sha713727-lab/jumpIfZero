import { env } from "../config/env.ts";
import { PayloadTooLargeError } from "../lib/errors.ts";
import type { IncomingMessage } from "node:http";
import type { Middleware } from "./context.ts";

function contentLength(req: IncomingMessage): number | null {
  const raw = req.headers["content-length"];
  if (raw === undefined) {
    return null;
  }
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export async function readRawBody(
  req: IncomingMessage,
  maxBytes: number,
  signal: AbortSignal,
): Promise<Buffer> {
  const declared = contentLength(req);
  if (declared !== null && declared > maxBytes) {
    req.resume();
    throw new PayloadTooLargeError();
  }

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    let settled = false;

    const fail = (err: Error): void => {
      if (settled) {
        return;
      }
      settled = true;
      req.off("data", onData);
      req.off("end", onEnd);
      req.off("error", onError);
      signal.removeEventListener("abort", onAbort);
      reject(err);
    };

    const succeed = (body: Buffer): void => {
      if (settled) {
        return;
      }
      settled = true;
      req.off("data", onData);
      req.off("end", onEnd);
      req.off("error", onError);
      signal.removeEventListener("abort", onAbort);
      resolve(body);
    };

    const onAbort = (): void => {
      fail(new Error("request aborted"));
    };

    const onError = (err: Error): void => {
      fail(err);
    };

    const onData = (chunk: Buffer | string): void => {
      const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
      total += buf.byteLength;
      if (total > maxBytes) {
        req.resume();
        fail(new PayloadTooLargeError());
        return;
      }
      chunks.push(buf);
    };

    const onEnd = (): void => {
      succeed(Buffer.concat(chunks, total));
    };

    if (signal.aborted) {
      fail(new Error("request aborted"));
      return;
    }

    signal.addEventListener("abort", onAbort, { once: true });
    req.on("data", onData);
    req.on("end", onEnd);
    req.on("error", onError);
  });
}

export const readBodyWithCap: Middleware = async (ctx) => {
  ctx.rawBody = await readRawBody(
    ctx.req,
    env.BODY_MAX_BYTES,
    ctx.abortController.signal,
  );
  ctx.bodyText = ctx.rawBody.toString("utf8");
};
