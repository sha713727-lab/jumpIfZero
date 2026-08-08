import { env } from "../config/env.ts";
import {
  claimHmacNonce as claimPostgres,
  deleteExpiredHmacNonces as deletePostgres,
} from "../repositories/hmac-nonces.ts";
import { getRedisClient, isRedisDegraded } from "./redis.ts";

async function claimRedis(input: {
  readonly nonce: string;
  readonly expiresAt: Date;
}): Promise<boolean | null> {
  if (env.NONCE_BACKEND !== "redis" || isRedisDegraded()) {
    return null;
  }
  const client = await getRedisClient();
  if (client === null) {
    return null;
  }
  try {
    const ttlSec = Math.max(
      1,
      Math.ceil((input.expiresAt.getTime() - Date.now()) / 1000),
    );
    const result = await client.set(`jz:nonce:${input.nonce}`, "1", {
      NX: true,
      EX: ttlSec,
    });
    return result === "OK";
  } catch {
    return null;
  }
}

export async function claimHmacNonce(input: {
  readonly nonce: string;
  readonly expiresAt: Date;
}): Promise<boolean> {
  const redisResult = await claimRedis(input);
  if (redisResult !== null) {
    return redisResult;
  }
  return claimPostgres(input);
}

export async function deleteExpiredHmacNonces(limit = 500): Promise<number> {
  if (env.NONCE_BACKEND === "redis" && !isRedisDegraded()) {
    return 0;
  }
  return deletePostgres(limit);
}
