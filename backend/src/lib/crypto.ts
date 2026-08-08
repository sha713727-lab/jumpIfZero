import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.ts";

export function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

export function canonicalQuery(searchParams: URLSearchParams): string {
  const pairs: string[] = [];
  const keys = [...new Set(searchParams.keys())].sort();
  for (const key of keys) {
    const values = searchParams.getAll(key).sort();
    for (const value of values) {
      pairs.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      );
    }
  }
  return pairs.join("&");
}

export function buildHmacPayload(input: {
  readonly method: string;
  readonly path: string;
  readonly canonicalQuery: string;
  readonly bodySha256: string;
  readonly timestamp: number;
  readonly nonce: string;
  readonly subjectId: string;
  readonly role: string;
  readonly employeeKind: string | null;
  readonly keyId: string;
}): string {
  return [
    "v1",
    input.method.toUpperCase(),
    input.path,
    input.canonicalQuery,
    input.bodySha256,
    String(input.timestamp),
    input.nonce,
    input.subjectId,
    input.role,
    input.employeeKind ?? "-",
    input.keyId,
  ].join("\n");
}

export function resolveHmacSecretForKeyId(input: {
  readonly keyId: string;
  readonly currentKeyId: string;
  readonly currentSecret: string;
  readonly previousKeyId?: string;
  readonly previousSecret?: string;
}): string | null {
  if (input.keyId === input.currentKeyId) {
    return input.currentSecret;
  }
  if (
    input.previousKeyId !== undefined &&
    input.previousSecret !== undefined &&
    input.keyId === input.previousKeyId
  ) {
    return input.previousSecret;
  }
  return null;
}

function secretForKeyId(keyId: string): string | null {
  return resolveHmacSecretForKeyId({
    keyId,
    currentKeyId: env.HMAC_KEY_ID,
    currentSecret: env.HMAC_SECRET,
    ...(env.HMAC_KEY_ID_PREVIOUS !== undefined
      ? { previousKeyId: env.HMAC_KEY_ID_PREVIOUS }
      : {}),
    ...(env.HMAC_SECRET_PREVIOUS !== undefined
      ? { previousSecret: env.HMAC_SECRET_PREVIOUS }
      : {}),
  });
}

export function signHmacPayload(payload: string, keyId: string): string {
  const secret = secretForKeyId(keyId);
  if (secret === null) {
    throw new Error("unknown hmac key id");
  }
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

export function verifyHmacSignature(input: {
  readonly payload: string;
  readonly keyId: string;
  readonly signatureHex: string;
}): boolean {
  const secret = secretForKeyId(input.keyId);
  if (secret === null) {
    return false;
  }

  let provided: Buffer;
  try {
    provided = Buffer.from(input.signatureHex, "hex");
  } catch {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(input.payload, "utf8")
    .digest();

  return (
    provided.byteLength === expected.byteLength &&
    timingSafeEqual(provided, expected)
  );
}

export function newCorrelationId(): string {
  return randomUUID();
}
