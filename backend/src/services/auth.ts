import {
  loginRequestSchema,
  passwordChangeRequestSchema,
  passwordForgotRequestSchema,
  passwordResetRequestSchema,
  sessionTokenRequestSchema,
  type Actor,
  type LoginRequest,
  type LoginResponse,
  type PasswordChangeRequest,
  type PasswordForgotRequest,
  type PasswordForgotResponse,
  type PasswordResetRequest,
  type SessionValidateResponse,
} from "@jumpifzero/contracts";
import { withTransaction } from "../db/transaction.ts";
import { sha256Hex } from "../lib/crypto.ts";
import {
  ConflictError,
  RateLimitError,
  UnauthorizedError,
} from "../lib/errors.ts";
import {
  generateOpaqueToken,
  hashOpaqueToken,
  hashPassword,
  verifyPassword,
} from "../lib/secrets.ts";
import { consumeRateLimitToken } from "../lib/rate-limit.ts";
import {
  deleteExpiredPasswordResetTokens,
  findActivePasswordResetToken,
  insertPasswordResetToken,
  markPasswordResetTokenUsed,
} from "../repositories/password-reset-tokens.ts";
import {
  deleteExpiredOrStaleSessions,
  extendSessionExpiry,
  findActiveSessionByTokenHash,
  insertSession,
  revokeAllSessionsForSubject,
  revokeSessionByTokenHash,
} from "../repositories/sessions.ts";
import {
  findActiveUserByEmail,
  findActiveUserById,
  updatePasswordHash,
} from "../repositories/users.ts";
import { parseInput } from "./_helpers.ts";
import {
  PASSWORD_RESET_TTL_MS,
  SESSION_TTL_MS,
  sessionCookieMeta,
  toAuthSubject,
} from "./authz.ts";

const timingHashPromise = hashPassword("timing-pad-not-a-real-password");

async function cleanupAuthArtifacts(): Promise<void> {
  await deleteExpiredOrStaleSessions();
  await deleteExpiredPasswordResetTokens();
}

async function enforceLoginRateLimit(input: {
  readonly email: string;
  readonly clientIp: string;
}): Promise<void> {
  const emailKey = sha256Hex(input.email.toLowerCase());
  const ipKey = sha256Hex(input.clientIp);
  const result = await consumeRateLimitToken({
    bucketKey: `auth.login:${ipKey}:${emailKey}`,
    capacity: 5,
    refillPerSecond: 0.1,
  });
  if (!result.allowed) {
    throw new RateLimitError(10);
  }
}

export async function login(
  raw: unknown,
  clientIp: string,
): Promise<LoginResponse> {
  await cleanupAuthArtifacts();
  const body = parseInput(loginRequestSchema, raw) satisfies LoginRequest;
  await enforceLoginRateLimit({ email: body.email, clientIp });

  const user = await findActiveUserByEmail(body.email);
  const passwordOk =
    user !== null
      ? await verifyPassword(user.password_hash, body.password)
      : await verifyPassword(await timingHashPromise, body.password);

  if (user === null || !passwordOk) {
    throw new UnauthorizedError();
  }

  const subject = await toAuthSubject(user);
  const sessionToken = generateOpaqueToken();
  const tokenHash = hashOpaqueToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await insertSession({
    subjectId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    sessionToken,
    sessionId: session.id,
    expiresAt: session.expires_at.toISOString(),
    subject,
    cookie: sessionCookieMeta(user.role),
  };
}

export async function logout(raw: unknown): Promise<{ readonly revoked: true }> {
  await cleanupAuthArtifacts();
  const body = parseInput(sessionTokenRequestSchema, raw);
  const tokenHash = hashOpaqueToken(body.sessionToken);
  await revokeSessionByTokenHash(tokenHash);
  return { revoked: true };
}

export async function validateSession(
  raw: unknown,
): Promise<SessionValidateResponse> {
  await cleanupAuthArtifacts();
  const body = parseInput(sessionTokenRequestSchema, raw);
  const tokenHash = hashOpaqueToken(body.sessionToken);
  const session = await findActiveSessionByTokenHash(tokenHash);
  if (session === null) {
    throw new UnauthorizedError();
  }

  const user = await findActiveUserById(session.subject_id);
  if (user === null) {
    await revokeSessionByTokenHash(tokenHash);
    throw new UnauthorizedError();
  }

  const remainingMs = session.expires_at.getTime() - Date.now();
  let expiresAt = session.expires_at;
  if (remainingMs < SESSION_TTL_MS / 2) {
    const extended = await extendSessionExpiry({
      sessionId: session.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });
    if (extended === null) {
      throw new UnauthorizedError();
    }
    expiresAt = extended.expires_at;
  }

  const subject = await toAuthSubject(user);
  return {
    sessionId: session.id,
    expiresAt: expiresAt.toISOString(),
    subject,
    cookie: sessionCookieMeta(user.role),
  };
}

export async function forgotPassword(
  raw: unknown,
): Promise<PasswordForgotResponse> {
  await cleanupAuthArtifacts();
  const body = parseInput(
    passwordForgotRequestSchema,
    raw,
  ) satisfies PasswordForgotRequest;

  const dummyToken = generateOpaqueToken();
  const user = await findActiveUserByEmail(body.email);
  if (user === null) {
    return { accepted: true, resetToken: dummyToken };
  }

  const resetToken = generateOpaqueToken();
  await insertPasswordResetToken({
    userId: user.id,
    tokenHash: hashOpaqueToken(resetToken),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
  });

  return { accepted: true, resetToken };
}

export async function resetPassword(
  raw: unknown,
): Promise<{ readonly reset: true }> {
  await cleanupAuthArtifacts();
  const body = parseInput(
    passwordResetRequestSchema,
    raw,
  ) satisfies PasswordResetRequest;

  const tokenHash = hashOpaqueToken(body.resetToken);
  const token = await findActivePasswordResetToken(tokenHash);
  if (token === null) {
    throw new UnauthorizedError();
  }

  const user = await findActiveUserById(token.user_id);
  if (user === null) {
    throw new UnauthorizedError();
  }

  const passwordHash = await hashPassword(body.newPassword);

  await withTransaction(async (client) => {
    const updated = await updatePasswordHash({
      userId: user.id,
      passwordHash,
      expectedVersion: user.version,
      client,
    });
    if (updated === null) {
      throw new ConflictError("Password update conflict");
    }
    const marked = await markPasswordResetTokenUsed(token.id, client);
    if (!marked) {
      throw new UnauthorizedError();
    }
    await revokeAllSessionsForSubject(user.id, client);
  });

  return { reset: true };
}

export async function changePassword(
  actor: Actor,
  raw: unknown,
): Promise<{ readonly changed: true }> {
  await cleanupAuthArtifacts();
  const body = parseInput(
    passwordChangeRequestSchema,
    raw,
  ) satisfies PasswordChangeRequest;

  const user = await findActiveUserById(actor.subjectId);
  if (user === null) {
    throw new UnauthorizedError();
  }

  const currentOk = await verifyPassword(
    user.password_hash,
    body.currentPassword,
  );
  if (!currentOk) {
    throw new UnauthorizedError();
  }

  const passwordHash = await hashPassword(body.newPassword);

  await withTransaction(async (client) => {
    const updated = await updatePasswordHash({
      userId: user.id,
      passwordHash,
      expectedVersion: user.version,
      client,
    });
    if (updated === null) {
      throw new ConflictError("Password update conflict");
    }
    await revokeAllSessionsForSubject(user.id, client);
  });

  return { changed: true };
}
