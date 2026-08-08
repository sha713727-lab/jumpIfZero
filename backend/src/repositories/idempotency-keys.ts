import {
  idempotencyKeyRowSchema,
  type IdempotencyKeyRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { parseRow } from "./_parse.ts";

const COLUMNS = `
  id, idempotency_key, method, path, subject_id,
  response_status, response_body, created_at, updated_at, expires_at
`;

export async function findActiveIdempotencyKey(
  input: {
    readonly key: string;
    readonly method: string;
    readonly path: string;
    readonly subjectId: string | null;
  },
  client?: DbQueryable,
): Promise<IdempotencyKeyRow | null> {
  const result = await query(
    `
      SELECT ${COLUMNS}
      FROM idempotency_keys
      WHERE idempotency_key = $1
        AND method = $2
        AND path = $3
        AND subject_id IS NOT DISTINCT FROM $4::uuid
        AND expires_at > now()
      LIMIT 1
    `,
    [input.key, input.method, input.path, input.subjectId],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(idempotencyKeyRowSchema, row);
}

export async function insertIdempotencyKey(
  input: {
    readonly key: string;
    readonly method: string;
    readonly path: string;
    readonly subjectId: string | null;
    readonly responseStatus: number;
    readonly responseBody: unknown;
    readonly expiresAt: Date;
  },
  client?: DbQueryable,
): Promise<IdempotencyKeyRow | null> {
  const result = await query(
    `
      INSERT INTO idempotency_keys (
        idempotency_key, method, path, subject_id,
        response_status, response_body, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
      ON CONFLICT (idempotency_key, method, path, subject_id) DO NOTHING
      RETURNING ${COLUMNS}
    `,
    [
      input.key,
      input.method,
      input.path,
      input.subjectId,
      input.responseStatus,
      JSON.stringify(input.responseBody),
      input.expiresAt,
    ],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(idempotencyKeyRowSchema, row);
}

export async function deleteExpiredIdempotencyKeys(
  limit = 500,
  client?: DbQueryable,
): Promise<number> {
  const result = await query(
    `
      DELETE FROM idempotency_keys
      WHERE id IN (
        SELECT id
        FROM idempotency_keys
        WHERE expires_at < now()
        ORDER BY expires_at ASC
        LIMIT $1
      )
    `,
    [limit],
    client,
  );
  return result.rowCount ?? 0;
}
