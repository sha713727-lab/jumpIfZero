import { RateLimitError, UnauthorizedError } from "../lib/errors.ts";
import { consumeRateLimitToken } from "../lib/rate-limit.ts";
import type { Middleware } from "./context.ts";

const DEFAULT_CAPACITY = 60;
const DEFAULT_REFILL_PER_SECOND = 1;

export function createRateLimiter(input?: {
  readonly capacity?: number;
  readonly refillPerSecond?: number;
}): Middleware {
  const capacity = input?.capacity ?? DEFAULT_CAPACITY;
  const refillPerSecond = input?.refillPerSecond ?? DEFAULT_REFILL_PER_SECOND;

  return async (ctx) => {
    const subjectKey =
      ctx.actor?.subjectId ??
      (ctx.isGateway ? ctx.hmacClaim?.subjectId : undefined);

    if (subjectKey === undefined) {
      throw new UnauthorizedError();
    }

    const routeKey = ctx.routeKey.length > 0 ? ctx.routeKey : "unresolved";
    const isAuthSensitive =
      routeKey === "auth.login" ||
      routeKey === "auth.register" ||
      routeKey === "auth.password.forgot" ||
      routeKey === "auth.password.reset";

    const isHealthOrMetrics =
      routeKey === "health.live" ||
      routeKey === "health.ready" ||
      routeKey === "metrics.get";

    const result = await consumeRateLimitToken({
      bucketKey: `${subjectKey}:${ctx.req.method ?? "GET"}:${routeKey}`,
      capacity: isHealthOrMetrics ? 120 : isAuthSensitive ? 20 : capacity,
      refillPerSecond: isHealthOrMetrics
        ? 2
        : isAuthSensitive
          ? 0.2
          : refillPerSecond,
    });

    if (!result.allowed) {
      throw new RateLimitError(1);
    }
  };
}

export const rateLimit = createRateLimiter();
