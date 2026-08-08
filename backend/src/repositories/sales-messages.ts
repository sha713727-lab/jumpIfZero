import {
  salesMessageRowSchema,
  type SalesMessageRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";

const MESSAGE_COLUMNS = `
  id, from_rep_id, to_rep_id, body, sent_at, read_at, created_at, updated_at
`;

export async function getSalesMessageById(
  id: string,
  client?: DbQueryable,
): Promise<SalesMessageRow | null> {
  const result = await query(
    `
      SELECT ${MESSAGE_COLUMNS}
      FROM sales_messages
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
  return parseRow(salesMessageRowSchema, row);
}

export async function listSalesMessages(input: {
  readonly limit: number;
  readonly offset: number;
  readonly peerRepId?: string;
  readonly q?: string;
  readonly sort: "sent_at";
  readonly dir: "asc" | "desc";
  readonly repScope: "all" | string;
}): Promise<{
  readonly items: readonly SalesMessageRow[];
  readonly total: number;
}> {
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.repScope !== "all" && input.peerRepId !== undefined) {
    params.push(input.repScope, input.peerRepId);
    where.push(
      `((from_rep_id = $${params.length - 1} AND to_rep_id = $${params.length}) OR (from_rep_id = $${params.length} AND to_rep_id = $${params.length - 1}))`,
    );
  } else if (input.repScope !== "all") {
    params.push(input.repScope);
    where.push(
      `(from_rep_id = $${params.length} OR to_rep_id = $${params.length})`,
    );
  } else if (input.peerRepId !== undefined) {
    params.push(input.peerRepId);
    where.push(
      `(from_rep_id = $${params.length} OR to_rep_id = $${params.length})`,
    );
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(`body ILIKE $${params.length}`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${MESSAGE_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM sales_messages
      ${whereSql}
      ORDER BY sent_at ${dir}, id ASC
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
    items: result.rows.map((row) => parseRow(salesMessageRowSchema, row)),
    total,
  };
}

export async function insertSalesMessage(
  input: {
    readonly fromRepId: string;
    readonly toRepId: string;
    readonly body: string;
  },
  client?: DbQueryable,
): Promise<SalesMessageRow> {
  const result = await query(
    `
      INSERT INTO sales_messages (from_rep_id, to_rep_id, body)
      VALUES ($1, $2, $3)
      RETURNING id
    `,
    [input.fromRepId, input.toRepId, input.body],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    throw new InternalError("insertSalesMessage returned no row");
  }
  const row = await getSalesMessageById(id, client);
  if (row === null) {
    throw new InternalError("insertSalesMessage could not reload row");
  }
  return row;
}

export async function markSalesMessageRead(
  id: string,
  client?: DbQueryable,
): Promise<SalesMessageRow | null> {
  const result = await query(
    `
      UPDATE sales_messages
      SET
        read_at = now(),
        updated_at = now()
      WHERE id = $1
        AND read_at IS NULL
      RETURNING id
    `,
    [id],
    client,
  );
  const rowId = (result.rows[0] as { id: string } | undefined)?.id;
  if (rowId === undefined) {
    const existing = await getSalesMessageById(id, client);
    return existing;
  }
  return getSalesMessageById(rowId, client);
}

export async function deleteSalesMessage(
  id: string,
  client?: DbQueryable,
): Promise<boolean> {
  const result = await query(
    `
      DELETE FROM sales_messages
      WHERE id = $1
    `,
    [id],
    client,
  );
  return (result.rowCount ?? 0) > 0;
}
