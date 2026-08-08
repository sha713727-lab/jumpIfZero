import { createHash, createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

function loadEnv(): Record<string, string> {
  const text = readFileSync(path.join(root, "backend", ".env"), "utf8");
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i), line.slice(i + 1)];
      }),
  );
}

export const testEnv = loadEnv();
export const baseUrl = `http://${testEnv.HOST}:${testEnv.PORT}`;

export const gatewayActor = {
  subjectId: testEnv.HMAC_GATEWAY_SUBJECT_ID,
  role: "gateway",
  employeeKind: null,
};

export type TestActor = {
  readonly subjectId: string;
  readonly role: string;
  readonly employeeKind: string | null;
};

function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

function canonicalQuery(searchParams: URLSearchParams): string {
  const pairs: string[] = [];
  const keys = [...new Set(searchParams.keys())].sort();
  for (const key of keys) {
    for (const value of searchParams.getAll(key).sort()) {
      pairs.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      );
    }
  }
  return pairs.join("&");
}

function sign(input: {
  readonly method: string;
  readonly url: URL;
  readonly body: Buffer;
  readonly actor: TestActor;
}): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce =
    randomUUID().replaceAll("-", "") +
    randomUUID().replaceAll("-", "").slice(0, 8);
  const payload = [
    "v1",
    input.method.toUpperCase(),
    input.url.pathname,
    canonicalQuery(input.url.searchParams),
    sha256Hex(input.body),
    String(timestamp),
    nonce,
    input.actor.subjectId,
    input.actor.role,
    input.actor.employeeKind ?? "-",
    testEnv.HMAC_KEY_ID,
  ].join("\n");
  const signature = createHmac("sha256", testEnv.HMAC_SECRET)
    .update(payload, "utf8")
    .digest("hex");
  const headers: Record<string, string> = {
    "x-jz-key-id": testEnv.HMAC_KEY_ID,
    "x-jz-timestamp": String(timestamp),
    "x-jz-nonce": nonce,
    "x-jz-subject-id": input.actor.subjectId,
    "x-jz-role": input.actor.role,
    "x-jz-signature": signature,
  };
  if (input.actor.employeeKind) {
    headers["x-jz-employee-kind"] = input.actor.employeeKind;
  }
  return headers;
}

export async function apiRequest(input: {
  readonly method: string;
  readonly path: string;
  readonly actor: TestActor;
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
  readonly rawBody?: Buffer;
}): Promise<{
  readonly status: number;
  readonly json: unknown;
  readonly headers: Headers;
}> {
  const url = new URL(input.path, baseUrl);
  const buf =
    input.rawBody ??
    (input.body === undefined
      ? Buffer.alloc(0)
      : Buffer.from(JSON.stringify(input.body), "utf8"));
  const headers: Record<string, string> = {
    ...sign({
      method: input.method,
      url,
      body: buf,
      actor: input.actor,
    }),
    ...(input.headers ?? {}),
  };
  if (input.body !== undefined && input.rawBody === undefined) {
    headers["content-type"] = "application/json";
  }
  const response = await fetch(url, {
    method: input.method,
    headers,
    body: buf.byteLength > 0 ? new Uint8Array(buf) : undefined,
  });
  const text = await response.text();
  let json: unknown = null;
  if (text.length > 0) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }
  return { status: response.status, json, headers: response.headers };
}

export async function loginAs(
  email: string,
  password: string,
): Promise<TestActor> {
  const cached = actorCache.get(email);
  if (cached) {
    return cached;
  }
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const result = await apiRequest({
      method: "POST",
      path: "/auth/login",
      actor: gatewayActor,
      body: { email, password },
    });
    if (result.status === 200) {
      const envelope = result.json as {
        data: {
          subject: {
            subjectId: string;
            role: string;
            employeeKind: string | null;
          };
        };
      };
      const actor = {
        subjectId: envelope.data.subject.subjectId,
        role: envelope.data.subject.role,
        employeeKind: envelope.data.subject.employeeKind ?? null,
      };
      actorCache.set(email, actor);
      return actor;
    }
    if (result.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      lastError = new Error(`login rate-limited ${email}`);
      continue;
    }
    throw new Error(`login failed ${email}: ${result.status}`);
  }
  throw lastError ?? new Error(`login failed ${email}`);
}

const actorCache = new Map<string, TestActor>();

export function dataOf<T>(result: { status: number; json: unknown }): T {
  const envelope = result.json as { ok?: boolean; data?: T };
  if (result.status >= 400 || envelope.ok !== true || envelope.data === undefined) {
    throw new Error(`unexpected response ${result.status} ${JSON.stringify(result.json)}`);
  }
  return envelope.data;
}

export const DEV_PASSWORDS = {
  admin: { email: "admin@jumpifzero.example", password: "DevAdminPass1!" },
  delivery: {
    email: "delivery@jumpifzero.example",
    password: "DevDeliveryPass1!",
  },
  sales: { email: "sales@jumpifzero.example", password: "DevSalesPass1!" },
  client: { email: "client@jumpifzero.example", password: "DevClientPass1!" },
} as const;

export const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
