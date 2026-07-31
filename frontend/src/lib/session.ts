import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";

export type SessionRole = "admin" | "customer" | "employee";

export type SessionPayload = {
  readonly role: SessionRole;
  readonly subjectId: string;
  readonly iat: number;
  readonly exp: number;
};

export const SESSION_COOKIE_NAME = "__Host-jz_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

const LOGIN_PATH: Record<SessionRole, string> = {
  admin: "/admin/login",
  customer: "/login",
  employee: "/employee/login",
};

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

function isSessionRole(value: unknown): value is SessionRole {
  return value === "admin" || value === "customer" || value === "employee";
}

function parsePayload(encodedPayload: string): SessionPayload | null {
  const raw = base64UrlDecode(encodedPayload);

  if (!raw) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw.toString("utf8")) as unknown;
  } catch {
    return null;
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("role" in parsed) ||
    !("subjectId" in parsed) ||
    !("iat" in parsed) ||
    !("exp" in parsed)
  ) {
    return null;
  }

  const role = parsed.role;
  const subjectId = parsed.subjectId;
  const iat = parsed.iat;
  const exp = parsed.exp;

  if (
    !isSessionRole(role) ||
    typeof subjectId !== "string" ||
    subjectId.length === 0 ||
    typeof iat !== "number" ||
    typeof exp !== "number" ||
    !Number.isFinite(iat) ||
    !Number.isFinite(exp)
  ) {
    return null;
  }

  return { role, subjectId, iat, exp };
}

export function sealSessionValue(
  role: SessionRole,
  subjectId: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const payload: SessionPayload = {
    role,
    subjectId,
    iat: nowSeconds,
    exp: nowSeconds + SESSION_MAX_AGE_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signEncodedPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function readSessionValue(
  value: string,
  role?: SessionRole,
  nowSeconds = Math.floor(Date.now() / 1000),
): SessionPayload | null {
  const separator = value.indexOf(".");

  if (separator <= 0 || separator === value.length - 1) {
    return null;
  }

  const encodedPayload = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  if (encodedPayload.includes(".") || signature.includes(".")) {
    return null;
  }

  const expected = signEncodedPayload(encodedPayload);

  if (!signaturesEqual(signature, expected)) {
    return null;
  }

  const payload = parsePayload(encodedPayload);

  if (!payload) {
    return null;
  }

  if (payload.exp <= nowSeconds) {
    return null;
  }

  if (role !== undefined && payload.role !== role) {
    return null;
  }

  return payload;
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

export async function createSession(
  role: SessionRole,
  subjectId: string,
): Promise<string> {
  const value = sealSessionValue(role, subjectId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, value, cookieOptions(SESSION_MAX_AGE_SECONDS));
  return value;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", cookieOptions(0));
}

export async function verifySession(
  role?: SessionRole,
): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  return readSessionValue(value, role);
}

export async function requireSession(role: SessionRole): Promise<SessionPayload> {
  const session = await verifySession(role);

  if (!session) {
    redirect(LOGIN_PATH[role]);
  }

  return session;
}
