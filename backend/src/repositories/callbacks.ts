import {
  callbackRowSchema,
  type CallbackRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { pool } from "../db/pool.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

const CALLBACK_COLUMNS = `
  id, name, email, phone, note, status_code,
  version, created_at, updated_at, archived_at
`;

export type CallbackInsert = {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly note: string;
};

export type CallbackStatusUpdate = {
  readonly id: string;
  readonly version: number;
  readonly status: "new" | "resolved";
};

function callbackSortColumn(
  sort: "created_at" | "updated_at" | "status_code",
): string {
  switch (sort) {
    case "status_code":
      return "status_code";
    case "updated_at":
      return "updated_at";
    default:
      return "created_at";
  }
}

async function getActiveCallbackByIdWithClient(
  id: string,
  client: DbQueryable,
): Promise<CallbackRow> {
  const result = await query(
    `
      SELECT ${CALLBACK_COLUMNS}
      FROM callbacks_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("Callback not visible after write");
  }

  return parseRow(callbackRowSchema, row);
}

export async function listActiveCallbacks(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly status?: "new" | "resolved";
  readonly sort: "created_at" | "updated_at" | "status_code";
  readonly dir: "asc" | "desc";
}): Promise<{ readonly items: readonly CallbackRow[]; readonly total: number }> {
  const sortColumn = callbackSortColumn(input.sort);
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.status !== undefined) {
    params.push(input.status);
    where.push(`status_code = $${params.length}`);
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${CALLBACK_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM callbacks_active
      ${whereSql}
      ORDER BY ${sortColumn} ${dir}, id ASC
      LIMIT $${limitIdx}
      OFFSET $${offsetIdx}
    `,
    params,
  );

  const total =
    result.rows.length === 0
      ? 0
      : Number((result.rows[0] as { total_count: number }).total_count);

  return {
    items: result.rows.map((row) => parseRow(callbackRowSchema, row)),
    total,
  };
}

export async function getActiveCallbackById(
  id: string,
): Promise<CallbackRow | null> {
  const result = await query(
    `
      SELECT ${CALLBACK_COLUMNS}
      FROM callbacks_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(callbackRowSchema, row);
}

export async function getCallbackByIdFromBase(
  id: string,
): Promise<CallbackRow | null> {
  const result = await query(
    `
      SELECT ${CALLBACK_COLUMNS}
      FROM callbacks
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(callbackRowSchema, row);
}

export async function insertCallback(
  input: CallbackInsert,
  client: DbQueryable = pool,
): Promise<CallbackRow> {
  const id = await nextUuidv7(client);

  await query(
    `
      INSERT INTO callbacks (
        id, name, email, phone, note, status_code
      )
      VALUES ($1, $2, $3, $4, $5, 'new')
    `,
    [id, input.name, input.email, input.phone, input.note],
    client,
  );

  return getActiveCallbackByIdWithClient(id, client);
}

export async function updateCallbackStatus(
  input: CallbackStatusUpdate,
  client: DbQueryable = pool,
): Promise<CallbackRow | null> {
  const result = await query(
    `
      UPDATE callbacks
      SET
        status_code = $3,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
    `,
    [input.id, input.version, input.status],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveCallbackByIdWithClient(input.id, client);
}

export async function archiveCallback(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE callbacks
      SET
        archived_at = now(),
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
    `,
    [input.id, input.version],
    client,
  );

  return (result.rowCount ?? 0) > 0;
}

export async function restoreCallback(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<CallbackRow | null> {
  const result = await query(
    `
      UPDATE callbacks
      SET
        archived_at = NULL,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NOT NULL
      RETURNING id
    `,
    [input.id, input.version],
    client,
  );

  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }

  return getActiveCallbackByIdWithClient(id, client);
}
