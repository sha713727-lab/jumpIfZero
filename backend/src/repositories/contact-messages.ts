import {
  contactMessageRowSchema,
  type ContactMessageRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { pool } from "../db/pool.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

const CONTACT_MESSAGE_COLUMNS = `
  id, name, email, subject, body, status_code,
  version, created_at, updated_at, archived_at
`;

export type ContactMessageInsert = {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly body: string;
};

export type ContactMessageStatusUpdate = {
  readonly id: string;
  readonly version: number;
  readonly status: "new" | "read";
};

function contactMessageSortColumn(
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

async function getActiveContactMessageByIdWithClient(
  id: string,
  client: DbQueryable,
): Promise<ContactMessageRow> {
  const result = await query(
    `
      SELECT ${CONTACT_MESSAGE_COLUMNS}
      FROM contact_messages_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("Contact message not visible after write");
  }

  return parseRow(contactMessageRowSchema, row);
}

export async function listActiveContactMessages(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly status?: "new" | "read";
  readonly sort: "created_at" | "updated_at" | "status_code";
  readonly dir: "asc" | "desc";
}): Promise<{
  readonly items: readonly ContactMessageRow[];
  readonly total: number;
}> {
  const sortColumn = contactMessageSortColumn(input.sort);
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
      `(name ILIKE $${params.length} OR email ILIKE $${params.length} OR subject ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${CONTACT_MESSAGE_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM contact_messages_active
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
    items: result.rows.map((row) => parseRow(contactMessageRowSchema, row)),
    total,
  };
}

export async function getActiveContactMessageById(
  id: string,
): Promise<ContactMessageRow | null> {
  const result = await query(
    `
      SELECT ${CONTACT_MESSAGE_COLUMNS}
      FROM contact_messages_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(contactMessageRowSchema, row);
}

export async function getContactMessageByIdFromBase(
  id: string,
): Promise<ContactMessageRow | null> {
  const result = await query(
    `
      SELECT ${CONTACT_MESSAGE_COLUMNS}
      FROM contact_messages
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(contactMessageRowSchema, row);
}

export async function insertContactMessage(
  input: ContactMessageInsert,
  client: DbQueryable = pool,
): Promise<ContactMessageRow> {
  const id = await nextUuidv7(client);

  await query(
    `
      INSERT INTO contact_messages (
        id, name, email, subject, body, status_code
      )
      VALUES ($1, $2, $3, $4, $5, 'new')
    `,
    [id, input.name, input.email, input.subject, input.body],
    client,
  );

  return getActiveContactMessageByIdWithClient(id, client);
}

export async function updateContactMessageStatus(
  input: ContactMessageStatusUpdate,
  client: DbQueryable = pool,
): Promise<ContactMessageRow | null> {
  const result = await query(
    `
      UPDATE contact_messages
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

  return getActiveContactMessageByIdWithClient(input.id, client);
}

export async function archiveContactMessage(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE contact_messages
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

export async function restoreContactMessage(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<ContactMessageRow | null> {
  const result = await query(
    `
      UPDATE contact_messages
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

  return getActiveContactMessageByIdWithClient(id, client);
}
