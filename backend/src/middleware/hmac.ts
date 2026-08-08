import { hmacHeadersSchema } from "@jumpifzero/contracts";
import {
  buildHmacPayload,
  canonicalQuery,
  sha256Hex,
  verifyHmacSignature,
} from "../lib/crypto.ts";
import { UnauthorizedError } from "../lib/errors.ts";
import {
  claimHmacNonce,
  deleteExpiredHmacNonces,
} from "../lib/hmac-nonce.ts";
import type { Middleware } from "./context.ts";

const TIMESTAMP_WINDOW_SEC = 300;
const NONCE_TTL_SEC = 600;
const NONCE_CLEANUP_INTERVAL_MS = 30_000;

let lastNonceCleanupAtMs = 0;
let nonceCleanupInFlight: Promise<number> | null = null;

async function maybeCleanupExpiredNonces(): Promise<void> {
  const now = Date.now();
  if (now - lastNonceCleanupAtMs < NONCE_CLEANUP_INTERVAL_MS) {
    return;
  }
  if (nonceCleanupInFlight !== null) {
    await nonceCleanupInFlight;
    return;
  }
  lastNonceCleanupAtMs = now;
  nonceCleanupInFlight = deleteExpiredHmacNonces().finally(() => {
    nonceCleanupInFlight = null;
  });
  await nonceCleanupInFlight;
}

function headerValue(
  headers: NodeJS.Dict<string | string[] | undefined>,
  name: string,
): string | undefined {
  const raw = headers[name];
  if (Array.isArray(raw)) {
    return raw[0];
  }
  return raw;
}

export const verifyHmac: Middleware = async (ctx) => {
  await maybeCleanupExpiredNonces();

  const employeeKindRaw = headerValue(ctx.req.headers, "x-jz-employee-kind");
  const parsed = hmacHeadersSchema.safeParse({
    keyId: headerValue(ctx.req.headers, "x-jz-key-id"),
    timestamp: headerValue(ctx.req.headers, "x-jz-timestamp"),
    nonce: headerValue(ctx.req.headers, "x-jz-nonce"),
    subjectId: headerValue(ctx.req.headers, "x-jz-subject-id"),
    role: headerValue(ctx.req.headers, "x-jz-role"),
    employeeKind:
      employeeKindRaw === undefined || employeeKindRaw === ""
        ? null
        : employeeKindRaw,
    signature: headerValue(ctx.req.headers, "x-jz-signature"),
  });

  if (!parsed.success) {
    throw new UnauthorizedError();
  }

  const headers = parsed.data;
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - headers.timestamp) > TIMESTAMP_WINDOW_SEC) {
    throw new UnauthorizedError();
  }

  if (headers.role === "gateway" && headers.employeeKind !== null) {
    throw new UnauthorizedError();
  }

  if (headers.role === "employee" && headers.employeeKind === null) {
    throw new UnauthorizedError();
  }

  if (
    (headers.role === "admin" || headers.role === "client") &&
    headers.employeeKind !== null
  ) {
    throw new UnauthorizedError();
  }

  const host = ctx.req.headers.host ?? "localhost";
  const url = new URL(ctx.req.url ?? "/", `http://${host}`);
  const payload = buildHmacPayload({
    method: ctx.req.method ?? "GET",
    path: url.pathname,
    canonicalQuery: canonicalQuery(url.searchParams),
    bodySha256: sha256Hex(ctx.rawBody),
    timestamp: headers.timestamp,
    nonce: headers.nonce,
    subjectId: headers.subjectId,
    role: headers.role,
    employeeKind: headers.employeeKind,
    keyId: headers.keyId,
  });

  const ok = verifyHmacSignature({
    payload,
    keyId: headers.keyId,
    signatureHex: headers.signature,
  });

  if (!ok) {
    throw new UnauthorizedError();
  }

  const claimed = await claimHmacNonce({
    nonce: headers.nonce,
    expiresAt: new Date((headers.timestamp + NONCE_TTL_SEC) * 1000),
  });

  if (!claimed) {
    throw new UnauthorizedError();
  }

  ctx.hmacClaim = {
    subjectId: headers.subjectId,
    role: headers.role,
    employeeKind: headers.employeeKind,
  };
};
