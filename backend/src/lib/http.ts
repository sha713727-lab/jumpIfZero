import type { ServerResponse } from "node:http";
import { env } from "../config/env.ts";
import {
  RateLimitError,
  toPublicError,
  type PublicErrorBody,
} from "./errors.ts";

export type SuccessEnvelope<T> = {
  readonly ok: true;
  readonly data: T;
  readonly correlationId: string;
};

export function successEnvelope<T>(
  data: T,
  correlationId: string,
): SuccessEnvelope<T> {
  return { ok: true, data, correlationId };
}

export function applySecurityHeaders(res: ServerResponse): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", env.CORS_ORIGIN);
  res.setHeader("Vary", "Origin");
}

export function sendJson(
  res: ServerResponse,
  status: number,
  body: SuccessEnvelope<unknown> | PublicErrorBody,
): void {
  applySecurityHeaders(res);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function sendNoContent(res: ServerResponse): void {
  applySecurityHeaders(res);
  res.statusCode = 204;
  res.end();
}

export function sendError(
  res: ServerResponse,
  error: unknown,
  correlationId: string,
): void {
  const publicError = toPublicError(error, correlationId);
  if (error instanceof RateLimitError) {
    res.setHeader("Retry-After", String(error.retryAfterSeconds));
  }
  sendJson(res, publicError.status, publicError.body);
}
