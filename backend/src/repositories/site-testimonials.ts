import {
  siteTestimonialRowSchema,
  type SiteTestimonialAccent,
  type SiteTestimonialRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { pool } from "../db/pool.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

const COLUMNS = `
  id, quote, author_name, role_title, company, accent, image_path,
  sort_order, published_at, version, created_at, updated_at
`;

export type SiteTestimonialInsert = {
  readonly quote: string;
  readonly authorName: string;
  readonly roleTitle: string;
  readonly company: string;
  readonly accent: SiteTestimonialAccent;
  readonly imagePath: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type SiteTestimonialUpdate = {
  readonly id: string;
  readonly version: number;
  readonly quote: string;
  readonly authorName: string;
  readonly roleTitle: string;
  readonly company: string;
  readonly accent: SiteTestimonialAccent;
  readonly imagePath: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type SiteTestimonialReorderItem = {
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
): Promise<SiteTestimonialRow> {
  const result = await query(
    `
      SELECT ${COLUMNS}
      FROM site_testimonials_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("Site testimonial not visible after write");
  }

  return parseRow(siteTestimonialRowSchema, row);
}

export async function listActiveSiteTestimonials(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly publishedOnly: boolean;
  readonly sort: "created_at" | "updated_at" | "sort_order" | "published_at";
  readonly dir: "asc" | "desc";
}): Promise<{
  readonly items: readonly SiteTestimonialRow[];
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
      `(quote ILIKE $${params.length} OR author_name ILIKE $${params.length} OR company ILIKE $${params.length})`,
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
      FROM site_testimonials_active
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
    items: result.rows.map((row) => parseRow(siteTestimonialRowSchema, row)),
    total,
  };
}

export async function getActiveSiteTestimonialById(
  id: string,
): Promise<SiteTestimonialRow | null> {
  const result = await query(
    `
      SELECT ${COLUMNS}
      FROM site_testimonials_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(siteTestimonialRowSchema, row);
}

export async function insertSiteTestimonial(
  input: SiteTestimonialInsert,
  client: DbQueryable = pool,
): Promise<SiteTestimonialRow> {
  const id = await nextUuidv7(client);

  await query(
    `
      INSERT INTO site_testimonials (
        id, quote, author_name, role_title, company, accent,
        image_path, sort_order, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      id,
      input.quote,
      input.authorName,
      input.roleTitle,
      input.company,
      input.accent,
      input.imagePath,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  return getActiveByIdWithClient(id, client);
}

export async function updateSiteTestimonial(
  input: SiteTestimonialUpdate,
  client: DbQueryable = pool,
): Promise<SiteTestimonialRow | null> {
  const result = await query(
    `
      UPDATE site_testimonials
      SET
        quote = $3,
        author_name = $4,
        role_title = $5,
        company = $6,
        accent = $7,
        image_path = $8,
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
      input.quote,
      input.authorName,
      input.roleTitle,
      input.company,
      input.accent,
      input.imagePath,
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

export async function reorderSiteTestimonials(
  items: readonly SiteTestimonialReorderItem[],
  client: DbQueryable = pool,
): Promise<boolean> {
  for (const item of items) {
    const result = await query(
      `
        UPDATE site_testimonials
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

export async function archiveSiteTestimonial(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE site_testimonials
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

export async function restoreSiteTestimonial(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<SiteTestimonialRow | null> {
  const result = await query(
    `
      UPDATE site_testimonials
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

async function getSiteTestimonialByIdFromBase(
  id: string,
  client?: DbQueryable,
): Promise<SiteTestimonialRow | null> {
  const result = await query(
    `
      SELECT ${COLUMNS}
      FROM site_testimonials
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

  return parseRow(siteTestimonialRowSchema, row);
}

export { getSiteTestimonialByIdFromBase };
