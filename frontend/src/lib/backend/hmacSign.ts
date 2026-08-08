import { createHash, createHmac, randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import type { Actor } from "@jumpifzero/contracts/content";

function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

function canonicalQuery(searchParams: URLSearchParams): string {
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

function buildHmacPayload(input: {
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

export function signBackendRequest(input: {
  readonly method: string;
  readonly url: URL;
  readonly body: Buffer;
  readonly actor: Actor;
}): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = randomUUID().replaceAll("-", "") + randomUUID().replaceAll("-", "").slice(0, 8);
  const payload = buildHmacPayload({
    method: input.method,
    path: input.url.pathname,
    canonicalQuery: canonicalQuery(input.url.searchParams),
    bodySha256: sha256Hex(input.body),
    timestamp,
    nonce,
    subjectId: input.actor.subjectId,
    role: input.actor.role,
    employeeKind: input.actor.employeeKind,
    keyId: env.hmacKeyId,
  });

  const signature = createHmac("sha256", env.hmacSecret)
    .update(payload, "utf8")
    .digest("hex");

  const headers: Record<string, string> = {
    "x-jz-key-id": env.hmacKeyId,
    "x-jz-timestamp": String(timestamp),
    "x-jz-nonce": nonce,
    "x-jz-subject-id": input.actor.subjectId,
    "x-jz-role": input.actor.role,
    "x-jz-signature": signature,
  };

  if (input.actor.employeeKind !== null) {
    headers["x-jz-employee-kind"] = input.actor.employeeKind;
  }

  return headers;
}

export function signGatewayRequest(input: {
  readonly method: string;
  readonly url: URL;
  readonly body: Buffer;
}): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce =
    randomUUID().replaceAll("-", "") +
    randomUUID().replaceAll("-", "").slice(0, 8);
  const payload = buildHmacPayload({
    method: input.method,
    path: input.url.pathname,
    canonicalQuery: canonicalQuery(input.url.searchParams),
    bodySha256: sha256Hex(input.body),
    timestamp,
    nonce,
    subjectId: env.hmacGatewaySubjectId,
    role: "gateway",
    employeeKind: null,
    keyId: env.hmacKeyId,
  });

  const signature = createHmac("sha256", env.hmacSecret)
    .update(payload, "utf8")
    .digest("hex");

  return {
    "x-jz-key-id": env.hmacKeyId,
    "x-jz-timestamp": String(timestamp),
    "x-jz-nonce": nonce,
    "x-jz-subject-id": env.hmacGatewaySubjectId,
    "x-jz-role": "gateway",
    "x-jz-signature": signature,
  };
}
