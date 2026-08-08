import { faqRowSchema, type FaqRow } from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { pool } from "../db/pool.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

const FAQ_COLUMNS = `
  id, question, answer, sort_order, published_at, version, created_at, updated_at
`;

export type FaqInsert = {
  readonly question: string;
  readonly answer: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type FaqUpdate = {
  readonly id: string;
  readonly version: number;
  readonly question: string;
  readonly answer: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type FaqReorderItem = {
  readonly id: string;
  readonly sortOrder: number;
  readonly version: number;
};

function faqSortColumn(
  sort: "created_at" | "updated_at" | "sort_order" | "published_at",
): string {
  switch (sort) {
    case "sort_order":
      return "sort_order";
    case "published_at":
      return "published_at";
    case "created_at":
      return "created_at";
    default:
      return "updated_at";
  }
}

async function getActiveFaqByIdWithClient(
  id: string,
  client: DbQueryable,
): Promise<FaqRow> {
  const result = await query(
    `
      SELECT ${FAQ_COLUMNS}
      FROM faqs_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("FAQ not visible after write");
  }

  return parseRow(faqRowSchema, row);
}

export async function listActiveFaqs(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly publishedOnly: boolean;
  readonly sort: "created_at" | "updated_at" | "sort_order" | "published_at";
  readonly dir: "asc" | "desc";
}): Promise<{ readonly items: readonly FaqRow[]; readonly total: number }> {
  const sortColumn = faqSortColumn(input.sort);
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.publishedOnly) {
    where.push("published_at IS NOT NULL");
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(question ILIKE $${params.length} OR answer ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${FAQ_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM faqs_active
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
    items: result.rows.map((row) => parseRow(faqRowSchema, row)),
    total,
  };
}

export async function getActiveFaqById(id: string): Promise<FaqRow | null> {
  const result = await query(
    `
      SELECT ${FAQ_COLUMNS}
      FROM faqs_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(faqRowSchema, row);
}

export async function insertFaq(
  input: FaqInsert,
  client: DbQueryable = pool,
): Promise<FaqRow> {
  const id = await nextUuidv7(client);

  await query(
    `
      INSERT INTO faqs (id, question, answer, sort_order, published_at)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [id, input.question, input.answer, input.sortOrder, input.publishedAt],
    client,
  );

  return getActiveFaqByIdWithClient(id, client);
}

export async function updateFaq(
  input: FaqUpdate,
  client: DbQueryable = pool,
): Promise<FaqRow | null> {
  const result = await query(
    `
      UPDATE faqs
      SET
        question = $3,
        answer = $4,
        sort_order = $5,
        published_at = $6,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.version,
      input.question,
      input.answer,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveFaqByIdWithClient(input.id, client);
}

export async function reorderFaqs(
  items: readonly FaqReorderItem[],
  client: DbQueryable = pool,
): Promise<boolean> {
  for (const item of items) {
    const result = await query(
      `
        UPDATE faqs
        SET
          sort_order = $3,
          version = version + 1,
          updated_at = now()
        WHERE id = $1
          AND version = $2
          AND archived_at IS NULL
      `,
      [item.id, item.version, item.sortOrder],
      client,
    );

    if ((result.rowCount ?? 0) === 0) {
      return false;
    }
  }

  return true;
}

export async function archiveFaq(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE faqs
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

export async function restoreFaq(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<FaqRow | null> {
  const result = await query(
    `
      UPDATE faqs
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

  return getActiveFaqByIdWithClient(id, client);
}

async function getFaqByIdFromBase(
  id: string,
  client?: DbQueryable,
): Promise<FaqRow | null> {
  const result = await query(
    `
      SELECT ${FAQ_COLUMNS}
      FROM faqs
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

  return parseRow(faqRowSchema, row);
}

export { getFaqByIdFromBase };
