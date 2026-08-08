import {
  passwordResetTokenRowSchema,
  type PasswordResetTokenRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";

export async function insertPasswordResetToken(input: {
  readonly userId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly client?: DbQueryable;
}): Promise<PasswordResetTokenRow> {
  const result = await query(
    `
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token_hash, expires_at, used_at, created_at, updated_at
    `,
    [input.userId, input.tokenHash, input.expiresAt],
    input.client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("insertPasswordResetToken returned no row");
  }
  return parseRow(passwordResetTokenRowSchema, row);
}

export async function findActivePasswordResetToken(
  tokenHash: string,
  client?: DbQueryable,
): Promise<PasswordResetTokenRow | null> {
  const result = await query(
    `
      SELECT id, user_id, token_hash, expires_at, used_at, created_at, updated_at
      FROM password_reset_tokens
      WHERE token_hash = $1
        AND used_at IS NULL
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
  return parseRow(passwordResetTokenRowSchema, row);
}

export async function markPasswordResetTokenUsed(
  id: string,
  client?: DbQueryable,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE password_reset_tokens
      SET
        used_at = now(),
        updated_at = now()
      WHERE id = $1
        AND used_at IS NULL
      RETURNING id
    `,
    [id],
    client,
  );
  return result.rows.length > 0;
}

export async function deleteExpiredPasswordResetTokens(
  limit = 500,
  client?: DbQueryable,
): Promise<number> {
  const result = await query(
    `
      DELETE FROM password_reset_tokens
      WHERE id IN (
        SELECT id
        FROM password_reset_tokens
        WHERE expires_at < now()
           OR (
             used_at IS NOT NULL
             AND used_at < now() - interval '24 hours'
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
