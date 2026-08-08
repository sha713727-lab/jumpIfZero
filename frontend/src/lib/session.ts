import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import {
  logoutResponseSchema,
  sessionValidateResponseSchema,
  type AuthSubject,
} from "@jumpifzero/contracts/auth";
import { env } from "@/lib/env";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";

export type SessionRole = "admin" | "customer" | "employee";

export type SessionPayload = {
  readonly role: SessionRole;
  readonly subjectId: string;
  readonly employeeId: string | null;
  readonly employeeKind: "delivery" | "sales" | null;
  readonly name: string;
  readonly email: string;
  readonly iat: number;
  readonly exp: number;
};

const LEGACY_SESSION_COOKIE_NAME = "__Host-jz_session";

export const SESSION_COOKIE_NAME_BY_ROLE = {
  admin: "__Host-jz_session_admin",
  customer: "__Host-jz_session_customer",
  employee: "__Host-jz_session_employee",
} as const satisfies Record<SessionRole, string>;

export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

const LOGIN_PATH: Record<SessionRole, string> = {
  admin: "/admin/login",
  customer: "/login",
  employee: "/employee/login",
};

const VALIDATE_CACHE_MS = 60_000;
const VALIDATE_CACHE_MAX = 2_000;
const validateCache = new Map<
  string,
  { readonly expiresAtMs: number; readonly payload: SessionPayload }
>();

function pruneValidateCache(nowMs: number): void {
  for (const [key, entry] of validateCache) {
    if (entry.expiresAtMs <= nowMs) {
      validateCache.delete(key);
    }
  }
  while (validateCache.size > VALIDATE_CACHE_MAX) {
    const oldest = validateCache.keys().next().value;
    if (oldest === undefined) {
      break;
    }
    validateCache.delete(oldest);
  }
}
function base64UrlEncode(value: Buffer | string): string {
  const buffer = typeof value === "string" ? Buffer.from(value, "utf8") : value;
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    return null;
  }
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return Buffer.from(base64, "base64");
  } catch {
    return null;
  }
}

function signEncodedPayload(encodedPayload: string): string {
  return base64UrlEncode(
    createHmac("sha256", env.sessionSecret)
      .update(encodedPayload)
      .digest(),
  );
}

function signaturesEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function sealOpaqueToken(sessionToken: string): string {
  const encoded = base64UrlEncode(sessionToken);
  return `${encoded}.${signEncodedPayload(encoded)}`;
}

function unsealOpaqueToken(value: string): string | null {
  const separator = value.indexOf(".");
  if (separator <= 0 || separator === value.length - 1) {
    return null;
  }
  const encoded = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (encoded.includes(".") || signature.includes(".")) {
    return null;
  }
  const expected = signEncodedPayload(encoded);
  if (!signaturesEqual(signature, expected)) {
    return null;
  }
  const raw = base64UrlDecode(encoded);
  if (!raw) {
    return null;
  }
  const token = raw.toString("utf8");
  if (token.length < 32 || token.length > 256) {
    return null;
  }
  return token;
}

function toSessionRole(role: AuthSubject["role"]): SessionRole {
  if (role === "client") {
    return "customer";
  }
  return role;
}

function subjectToPayload(
  subject: AuthSubject,
  expiresAtIso: string,
): SessionPayload {
  const exp = Math.floor(new Date(expiresAtIso).getTime() / 1000);
  return {
    role: toSessionRole(subject.role),
    subjectId: subject.subjectId,
    employeeId: subject.employeeId,
    employeeKind: subject.employeeKind,
    name: subject.name,
    email: subject.email,
    iat: Math.floor(Date.now() / 1000),
    exp,
  };
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

async function clearLegacySessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  if (cookieStore.get(LEGACY_SESSION_COOKIE_NAME)) {
    cookieStore.set(LEGACY_SESSION_COOKIE_NAME, "", cookieOptions(0));
  }
}

export async function createSessionFromLogin(input: {
  readonly sessionToken: string;
  readonly subject: AuthSubject;
  readonly expiresAt: string;
  readonly maxAge: number;
}): Promise<SessionPayload> {
  const role = toSessionRole(input.subject.role);
  const cookieStore = await cookies();
  await clearLegacySessionCookie();
  cookieStore.set(
    SESSION_COOKIE_NAME_BY_ROLE[role],
    sealOpaqueToken(input.sessionToken),
    cookieOptions(input.maxAge),
  );
  const payload = subjectToPayload(input.subject, input.expiresAt);
  validateCache.set(input.sessionToken, {
    expiresAtMs: Date.now() + VALIDATE_CACHE_MS,
    payload,
  });
  return payload;
}

export async function clearSession(role: SessionRole): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = SESSION_COOKIE_NAME_BY_ROLE[role];
  const value = cookieStore.get(cookieName)?.value;
  if (value) {
    const token = unsealOpaqueToken(value);
    if (token) {
      validateCache.delete(token);
      try {
        await gatewayBackendRequest({
          method: "POST",
          path: "/auth/logout",
          body: { sessionToken: token },
          outputSchema: logoutResponseSchema,
        });
      } catch {
        void 0;
      }
    }
  }
  cookieStore.set(cookieName, "", cookieOptions(0));
  await clearLegacySessionCookie();
}

async function validateToken(
  sessionToken: string,
): Promise<SessionPayload | null> {
  const nowMs = Date.now();
  pruneValidateCache(nowMs);
  const cached = validateCache.get(sessionToken);
  if (cached && cached.expiresAtMs > nowMs) {
    return cached.payload;
  }
  if (cached) {
    validateCache.delete(sessionToken);
  }

  try {
    const data = await gatewayBackendRequest({
      method: "POST",
      path: "/auth/session/validate",
      body: { sessionToken },
      outputSchema: sessionValidateResponseSchema,
    });
    const payload = subjectToPayload(data.subject, data.expiresAt);
    validateCache.set(sessionToken, {
      expiresAtMs: Date.now() + VALIDATE_CACHE_MS,
      payload,
    });
    pruneValidateCache(Date.now());
    return payload;
  } catch {
    validateCache.delete(sessionToken);
    return null;
  }
}

export const verifySession = cache(async function verifySession(
  role: SessionRole,
): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME_BY_ROLE[role])?.value;
  if (!value) {
    return null;
  }
  const token = unsealOpaqueToken(value);
  if (!token) {
    return null;
  }
  const payload = await validateToken(token);
  if (!payload) {
    return null;
  }
  if (payload.role !== role) {
    return null;
  }
  return payload;
});

export const requireSession = cache(async function requireSession(
  role: SessionRole,
): Promise<SessionPayload> {
  const session = await verifySession(role);
  if (!session) {
    redirect(LOGIN_PATH[role]);
  }
  return session;
});
