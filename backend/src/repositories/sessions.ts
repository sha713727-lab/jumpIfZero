import { sessionRowSchema, type SessionRow } from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";

export async function insertSession(input: {
  readonly subjectId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly client?: DbQueryable;
}): Promise<SessionRow> {
  const result = await query(
    `
      INSERT INTO sessions (subject_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, subject_id, token_hash, expires_at, revoked_at, created_at, updated_at
    `,
    [input.subjectId, input.tokenHash, input.expiresAt],
    input.client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("insertSession returned no row");
  }
  return parseRow(sessionRowSchema, row);
}

export async function findActiveSessionByTokenHash(
  tokenHash: string,
  client?: DbQueryable,
): Promise<SessionRow | null> {
  const result = await query(
    `
      SELECT id, subject_id, token_hash, expires_at, revoked_at, created_at, updated_at
      FROM sessions
      WHERE token_hash = $1
        AND revoked_at IS NULL
        AND expires_at > now()
      LIMIT 1
    `,
    [tokenHash],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(sessionRowSchema, row);
}

export async function extendSessionExpiry(input: {
  readonly sessionId: string;
  readonly expiresAt: Date;
  readonly client?: DbQueryable;
}): Promise<SessionRow | null> {
  const result = await query(
    `
      UPDATE sessions
      SET
        expires_at = $2,
        updated_at = now()
      WHERE id = $1
        AND revoked_at IS NULL
        AND expires_at > now()
      RETURNING id, subject_id, token_hash, expires_at, revoked_at, created_at, updated_at
    `,
    [input.sessionId, input.expiresAt],
    input.client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(sessionRowSchema, row);
}

export async function revokeSessionByTokenHash(
  tokenHash: string,
  client?: DbQueryable,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE sessions
      SET
        revoked_at = now(),
        updated_at = now()
      WHERE token_hash = $1
        AND revoked_at IS NULL
      RETURNING id
    `,
    [tokenHash],
    client,
  );
  return result.rows.length > 0;
}

export async function revokeAllSessionsForSubject(
  subjectId: string,
  client?: DbQueryable,
): Promise<number> {
  const result = await query(
    `
      UPDATE sessions
      SET
        revoked_at = now(),
        updated_at = now()
      WHERE subject_id = $1
        AND revoked_at IS NULL
      RETURNING id
    `,
    [subjectId],
    client,
  );
  return result.rowCount ?? 0;
}

export async function deleteExpiredOrStaleSessions(
  limit = 500,
  client?: DbQueryable,
): Promise<number> {
  const result = await query(
    `
      DELETE FROM sessions
      WHERE id IN (
        SELECT id
        FROM sessions
        WHERE expires_at < now()
           OR (
             revoked_at IS NOT NULL
             AND revoked_at < now() - interval '8 hours'
           )
        ORDER BY created_at ASC
        LIMIT $1
      )
    `,
    [limit],
    client,
  );
  return result.rowCount ?? 0;
}
