import { createClient, type RedisClientType } from "redis";
import { env } from "../config/env.ts";
import { logger } from "./logger.ts";

const DEGRADE_MS = 15_000;

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType | null> | null = null;
let degradedUntilMs = 0;

function wantsRedis(): boolean {
  return (
    env.RATE_LIMIT_BACKEND === "redis" || env.NONCE_BACKEND === "redis"
  );
}

function markDegraded(err: unknown): void {
  degradedUntilMs = Date.now() + DEGRADE_MS;
  logger.warn({
    msg: "redis degraded; falling back to postgres",
    err,
  });
}

export function isRedisDegraded(): boolean {
  return Date.now() < degradedUntilMs;
}

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!wantsRedis() || env.REDIS_URL === undefined) {
    return null;
  }
  const redisUrl = env.REDIS_URL;
  if (isRedisDegraded()) {
    return null;
  }
  if (client?.isOpen) {
    return client;
  }
  if (connecting !== null) {
    return connecting;
  }

  connecting = (async () => {
    try {
      const next = createClient({ url: redisUrl });
      next.on("error", (err: Error) => {
        markDegraded(err);
      });
      await next.connect();
      client = next as RedisClientType;
      return client;
    } catch (err) {
      markDegraded(err);
      return null;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

export async function closeRedis(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
  }
  client = null;
}
