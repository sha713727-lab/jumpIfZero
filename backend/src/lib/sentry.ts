import { env } from "../config/env.ts";
import { logger } from "./logger.ts";

let initialized = false;

export async function startSentry(): Promise<void> {
  if (env.SENTRY_DSN === undefined || initialized) {
    return;
  }
  initialized = true;
  const Sentry = await import("@sentry/node");
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: 0,
  });
  logger.info({ msg: "sentry initialized" });
}

export async function captureException(err: unknown): Promise<void> {
  if (env.SENTRY_DSN === undefined) {
    return;
  }
  const Sentry = await import("@sentry/node");
  Sentry.captureException(err);
}
