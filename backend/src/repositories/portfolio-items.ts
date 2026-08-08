import {
  portfolioItemRowSchema,
  type PortfolioItemRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { pool } from "../db/pool.ts";
import { ConflictError, InternalError } from "../lib/errors.ts";
import { isPgCode, parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

const PORTFOLIO_COLUMNS = `
  id, title, slug, category, summary, image_path,
  published_at, version, created_at, updated_at
`;

export type PortfolioItemInsert = {
  readonly title: string;
  readonly slug: string;
  readonly category: string;
  readonly summary: string;
  readonly imagePath: string;
  readonly publishedAt: Date | null;
};

export type PortfolioItemUpdate = {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly slug: string;
  readonly category: string;
  readonly summary: string;
  readonly imagePath: string;
  readonly publishedAt: Date | null;
};

function portfolioSortColumn(
  sort: "created_at" | "updated_at" | "title" | "slug" | "published_at",
): string {
  switch (sort) {
    case "title":
      return "title";
    case "slug":
      return "slug";
    case "published_at":
      return "published_at";
    case "created_at":
      return "created_at";
    default:
      return "updated_at";
  }
}

async function getActivePortfolioItemByIdWithClient(
  id: string,
  client: DbQueryable,
): Promise<PortfolioItemRow> {
  const result = await query(
    `
      SELECT ${PORTFOLIO_COLUMNS}
      FROM portfolio_items_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("Portfolio item not visible after write");
  }

  return parseRow(portfolioItemRowSchema, row);
}

export async function listActivePortfolioItems(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly category?: string;
  readonly publishedOnly: boolean;
  readonly sort: "created_at" | "updated_at" | "title" | "slug" | "published_at";
  readonly dir: "asc" | "desc";
}): Promise<{
  readonly items: readonly PortfolioItemRow[];
  readonly total: number;
}> {
  const sortColumn = portfolioSortColumn(input.sort);
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.publishedOnly) {
    where.push("published_at IS NOT NULL");
  }
  if (input.category !== undefined && input.category.length > 0) {
    params.push(input.category);
    where.push(`category = $${params.length}`);
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(title ILIKE $${params.length} OR slug ILIKE $${params.length} OR summary ILIKE $${params.length} OR category ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${PORTFOLIO_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM portfolio_items_active
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
    items: result.rows.map((row) => parseRow(portfolioItemRowSchema, row)),
    total,
  };
}

export async function getActivePortfolioItemById(
  id: string,
): Promise<PortfolioItemRow | null> {
  const result = await query(
    `
      SELECT ${PORTFOLIO_COLUMNS}
      FROM portfolio_items_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(portfolioItemRowSchema, row);
}

export async function getPortfolioItemByIdFromBase(
  id: string,
): Promise<PortfolioItemRow | null> {
  const result = await query(
    `
      SELECT ${PORTFOLIO_COLUMNS}
      FROM portfolio_items
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(portfolioItemRowSchema, row);
}

export async function getActivePortfolioItemBySlug(
  slug: string,
): Promise<PortfolioItemRow | null> {
  const result = await query(
    `
      SELECT ${PORTFOLIO_COLUMNS}
      FROM portfolio_items_active
      WHERE slug = $1
      LIMIT 1
    `,
    [slug],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(portfolioItemRowSchema, row);
}

export async function insertPortfolioItem(
  input: PortfolioItemInsert,
  client: DbQueryable = pool,
): Promise<PortfolioItemRow> {
  const id = await nextUuidv7(client);

  try {
    await query(
      `
        INSERT INTO portfolio_items (
          id, title, slug, category, summary, image_path, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        id,
        input.title,
        input.slug,
        input.category,
        input.summary,
        input.imagePath,
        input.publishedAt,
      ],
      client,
    );
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Portfolio item slug already exists");
    }
    throw err;
  }

  return getActivePortfolioItemByIdWithClient(id, client);
}

export async function updatePortfolioItem(
  input: PortfolioItemUpdate,
  client: DbQueryable = pool,
): Promise<PortfolioItemRow | null> {
  try {
    const result = await query(
      `
        UPDATE portfolio_items
        SET
          title = $3,
          slug = $4,
          category = $5,
          summary = $6,
          image_path = $7,
          published_at = $8,
          version = version + 1,
          updated_at = now()
        WHERE id = $1
          AND version = $2
          AND archived_at IS NULL
      `,
      [
        input.id,
        input.version,
        input.title,
        input.slug,
        input.category,
        input.summary,
        input.imagePath,
        input.publishedAt,
      ],
      client,
    );

    if ((result.rowCount ?? 0) === 0) {
      return null;
    }
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Portfolio item slug already exists");
    }
    throw err;
  }

  return getActivePortfolioItemByIdWithClient(input.id, client);
}

export async function archivePortfolioItem(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE portfolio_items
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

export async function restorePortfolioItem(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<PortfolioItemRow | null> {
  const result = await query(
    `
      UPDATE portfolio_items
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

  return getActivePortfolioItemByIdWithClient(id, client);
}
