import { env } from "../config/env.ts";
import { consumeRateLimitToken as consumePostgres } from "../repositories/rate-limit-buckets.ts";
import { getRedisClient, isRedisDegraded } from "./redis.ts";

const REDIS_LUA = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])
local now = tonumber(ARGV[4])
local data = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(data[1])
local ts = tonumber(data[2])
if tokens == nil then
  tokens = capacity
  ts = now
end
local elapsed = math.max(0, now - ts)
tokens = math.min(capacity, tokens + elapsed * refill)
if tokens < cost then
  redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
  redis.call('EXPIRE', key, 86400)
  return 0
end
tokens = tokens - cost
redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
redis.call('EXPIRE', key, 86400)
return 1
`;

async function consumeRedis(input: {
  readonly bucketKey: string;
  readonly capacity: number;
  readonly refillPerSecond: number;
  readonly cost: number;
}): Promise<{ readonly allowed: boolean } | null> {
  if (env.RATE_LIMIT_BACKEND !== "redis" || isRedisDegraded()) {
    return null;
  }
  const client = await getRedisClient();
  if (client === null) {
    return null;
  }
  try {
    const result = await client.eval(REDIS_LUA, {
      keys: [`jz:rl:${input.bucketKey}`],
      arguments: [
        String(input.capacity),
        String(input.refillPerSecond),
        String(input.cost),
        String(Date.now() / 1000),
      ],
    });
    return { allowed: result === 1 };
  } catch {
    return null;
  }
}

export async function consumeRateLimitToken(input: {
  readonly bucketKey: string;
  readonly capacity: number;
  readonly refillPerSecond: number;
  readonly cost?: number;
}): Promise<{ readonly allowed: boolean }> {
  const cost = input.cost ?? 1;
  const redisResult = await consumeRedis({ ...input, cost });
  if (redisResult !== null) {
    return redisResult;
  }
  return consumePostgres({ ...input, cost });
}
