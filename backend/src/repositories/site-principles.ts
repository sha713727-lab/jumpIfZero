import {
  sitePrincipleRowSchema,
  type SitePrincipleAccent,
  type SitePrincipleRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { pool } from "../db/pool.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

const COLUMNS = `
  id, index_label, title, body, accent, image_path, image_alt,
  sort_order, published_at, version, created_at, updated_at
`;

export type SitePrincipleInsert = {
  readonly indexLabel: string;
  readonly title: string;
  readonly body: string;
  readonly accent: SitePrincipleAccent;
  readonly imagePath: string;
  readonly imageAlt: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type SitePrincipleUpdate = {
  readonly id: string;
  readonly version: number;
  readonly indexLabel: string;
  readonly title: string;
  readonly body: string;
  readonly accent: SitePrincipleAccent;
  readonly imagePath: string;
  readonly imageAlt: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type SitePrincipleReorderItem = {
  readonly id: string;
  readonly sortOrder: number;
  readonly version: number;
};

function sortColumn(
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

async function getActiveByIdWithClient(
  id: string,
  client: DbQueryable,
): Promise<SitePrincipleRow> {
  const result = await query(
    `
      SELECT ${COLUMNS}
      FROM site_principles_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("Site principle not visible after write");
  }

  return parseRow(sitePrincipleRowSchema, row);
}

export async function listActiveSitePrinciples(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly publishedOnly: boolean;
  readonly sort: "created_at" | "updated_at" | "sort_order" | "published_at";
  readonly dir: "asc" | "desc";
}): Promise<{
  readonly items: readonly SitePrincipleRow[];
  readonly total: number;
}> {
  const column = sortColumn(input.sort);
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.publishedOnly) {
    where.push("published_at IS NOT NULL");
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(title ILIKE $${params.length} OR body ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM site_principles_active
      ${whereSql}
      ORDER BY ${column} ${dir}, id ASC
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
    items: result.rows.map((row) => parseRow(sitePrincipleRowSchema, row)),
    total,
  };
}

export async function getActiveSitePrincipleById(
  id: string,
): Promise<SitePrincipleRow | null> {
  const result = await query(
    `
      SELECT ${COLUMNS}
      FROM site_principles_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(sitePrincipleRowSchema, row);
}

export async function insertSitePrinciple(
  input: SitePrincipleInsert,
  client: DbQueryable = pool,
): Promise<SitePrincipleRow> {
  const id = await nextUuidv7(client);

  await query(
    `
      INSERT INTO site_principles (
        id, index_label, title, body, accent, image_path, image_alt,
        sort_order, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      id,
      input.indexLabel,
      input.title,
      input.body,
      input.accent,
      input.imagePath,
      input.imageAlt,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  return getActiveByIdWithClient(id, client);
}

export async function updateSitePrinciple(
  input: SitePrincipleUpdate,
  client: DbQueryable = pool,
): Promise<SitePrincipleRow | null> {
  const result = await query(
    `
      UPDATE site_principles
      SET
        index_label = $3,
        title = $4,
        body = $5,
        accent = $6,
        image_path = $7,
        image_alt = $8,
        sort_order = $9,
        published_at = $10,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.version,
      input.indexLabel,
      input.title,
      input.body,
      input.accent,
      input.imagePath,
      input.imageAlt,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveByIdWithClient(input.id, client);
}

export async function reorderSitePrinciples(
  items: readonly SitePrincipleReorderItem[],
  client: DbQueryable = pool,
): Promise<boolean> {
  for (const item of items) {
    const result = await query(
      `
        UPDATE site_principles
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

export async function archiveSitePrinciple(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE site_principles
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

export async function restoreSitePrinciple(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<SitePrincipleRow | null> {
  const result = await query(
    `
      UPDATE site_principles
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

  return getActiveByIdWithClient(id, client);
}

async function getSitePrincipleByIdFromBase(
  id: string,
  client?: DbQueryable,
): Promise<SitePrincipleRow | null> {
  const result = await query(
    `
      SELECT ${COLUMNS}
      FROM site_principles
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

  return parseRow(sitePrincipleRowSchema, row);
}

export { getSitePrincipleByIdFromBase };
