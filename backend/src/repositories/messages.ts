import {
  messageRowSchema,
  type MessageRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";

const MESSAGE_COLUMNS = `
  id, client_id, sender_role, sender_user_id, body,
  read_at, created_at, updated_at, archived_at
`;

export async function getMessageById(
  id: string,
  client?: DbQueryable,
): Promise<MessageRow | null> {
  const result = await query(
    `
      SELECT ${MESSAGE_COLUMNS}
      FROM messages
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(messageRowSchema, row);
}

export async function listMessages(input: {
  readonly limit: number;
  readonly offset: number;
  readonly clientId: string;
  readonly q?: string;
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at";
  readonly dir: "asc" | "desc";
  readonly clientIds: "all" | readonly string[];
}): Promise<{ readonly items: readonly MessageRow[]; readonly total: number }> {
  if (input.clientIds !== "all" && !input.clientIds.includes(input.clientId)) {
    return { items: [], total: 0 };
  }

  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [input.clientId];
  const where: string[] = [`client_id = $1`];

  if (input.archived === "active") {
    where.push("archived_at IS NULL");
  } else if (input.archived === "archived") {
    where.push("archived_at IS NOT NULL");
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(`body ILIKE $${params.length}`);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${MESSAGE_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM messages
      ${whereSql}
      ORDER BY created_at ${dir}, id ASC
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
    items: result.rows.map((row) => parseRow(messageRowSchema, row)),
    total,
  };
}

export async function insertMessage(
  input: {
    readonly clientId: string;
    readonly senderRole: "admin" | "client" | "employee";
    readonly senderUserId: string;
    readonly body: string;
  },
  client?: DbQueryable,
): Promise<MessageRow> {
  const result = await query(
    `
      INSERT INTO messages (client_id, sender_role, sender_user_id, body)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [input.clientId, input.senderRole, input.senderUserId, input.body],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    throw new InternalError("insertMessage returned no row");
  }
  const row = await getMessageById(id, client);
  if (row === null) {
    throw new InternalError("insertMessage could not reload row");
  }
  return row;
}

export async function markMessageRead(
  id: string,
  client?: DbQueryable,
): Promise<MessageRow | null> {
  const result = await query(
    `
      UPDATE messages
      SET
        read_at = COALESCE(read_at, now()),
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NULL
      RETURNING id
    `,
    [id],
    client,
  );
  const rowId = (result.rows[0] as { id: string } | undefined)?.id;
  if (rowId === undefined) {
    return null;
  }
  return getMessageById(rowId, client);
}

export async function archiveMessage(
  id: string,
  client?: DbQueryable,
): Promise<MessageRow | null> {
  const result = await query(
    `
      UPDATE messages
      SET
        archived_at = now(),
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NULL
      RETURNING id
    `,
    [id],
    client,
  );
  const rowId = (result.rows[0] as { id: string } | undefined)?.id;
  if (rowId === undefined) {
    return null;
  }
  return getMessageById(rowId, client);
}

export async function restoreMessage(
  id: string,
  client?: DbQueryable,
): Promise<MessageRow | null> {
  const result = await query(
    `
      UPDATE messages
      SET
        archived_at = NULL,
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NOT NULL
      RETURNING id
    `,
    [id],
    client,
  );
  const rowId = (result.rows[0] as { id: string } | undefined)?.id;
  if (rowId === undefined) {
    return null;
  }
  return getMessageById(rowId, client);
}
