import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import argon2 from "argon2";
import { env } from "../config/env.ts";
import { InternalError } from "./errors.ts";
import { sha256Hex } from "./crypto.ts";

const TOKEN_BYTES = 32;
const AEAD_IV_BYTES = 12;
const AEAD_VERSION = 1;

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function generateOpaqueToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashOpaqueToken(token: string): string {
  return sha256Hex(token);
}

export function safeEqualString(left: string, right: string): boolean {
  const leftBuf = Buffer.from(left, "utf8");
  const rightBuf = Buffer.from(right, "utf8");
  if (leftBuf.byteLength !== rightBuf.byteLength) {
    return false;
  }
  return timingSafeEqual(leftBuf, rightBuf);
}

function decodeAeadKey(value: string): Buffer {
  const key = Buffer.from(value, "base64");
  if (key.byteLength !== 32) {
    throw new InternalError("Invalid AEAD key length");
  }
  return key;
}

export function encryptTaxId(plaintext: string): Buffer {
  const key = decodeAeadKey(env.TAX_ID_AEAD_KEY);
  const iv = randomBytes(AEAD_IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from([AEAD_VERSION]), iv, tag, ciphertext]);
}

export function decryptTaxId(payload: Buffer): string {
  if (payload.byteLength < 1 + AEAD_IV_BYTES + 16) {
    throw new InternalError("Invalid tax ID ciphertext");
  }
  if (payload[0] !== AEAD_VERSION) {
    throw new InternalError("Unsupported tax ID ciphertext version");
  }

  const iv = payload.subarray(1, 1 + AEAD_IV_BYTES);
  const tag = payload.subarray(1 + AEAD_IV_BYTES, 1 + AEAD_IV_BYTES + 16);
  const ciphertext = payload.subarray(1 + AEAD_IV_BYTES + 16);

  const keys = [env.TAX_ID_AEAD_KEY];
  if (env.TAX_ID_AEAD_KEY_PREVIOUS !== undefined) {
    keys.push(env.TAX_ID_AEAD_KEY_PREVIOUS);
  }

  for (const encoded of keys) {
    try {
      const key = decodeAeadKey(encoded);
      const decipher = createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(tag);
      const plain = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return plain.toString("utf8");
    } catch {
      continue;
    }
  }

  throw new InternalError("Tax ID decryption failed");
}

export function maskTaxId(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) {
    return "****";
  }
  return `***-**-${digits.slice(-4)}`;
}
