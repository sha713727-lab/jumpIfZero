import {
  siteGalleryImageRowSchema,
  type SiteGalleryImageRow,
  type SiteGallerySectionKey,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { pool } from "../db/pool.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

const COLUMNS = `
  id, section_key, image_path, alt_text, sort_order,
  published_at, version, created_at, updated_at
`;

export type SiteGalleryImageInsert = {
  readonly sectionKey: SiteGallerySectionKey;
  readonly imagePath: string;
  readonly altText: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type SiteGalleryImageUpdate = {
  readonly id: string;
  readonly version: number;
  readonly sectionKey: SiteGallerySectionKey;
  readonly imagePath: string;
  readonly altText: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type SiteGalleryImageReorderItem = {
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
): Promise<SiteGalleryImageRow> {
  const result = await query(
    `
      SELECT ${COLUMNS}
      FROM site_gallery_images_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("Site gallery image not visible after write");
  }

  return parseRow(siteGalleryImageRowSchema, row);
}

export async function listActiveSiteGalleryImages(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly sectionKey?: SiteGallerySectionKey;
  readonly publishedOnly: boolean;
  readonly sort: "created_at" | "updated_at" | "sort_order" | "published_at";
  readonly dir: "asc" | "desc";
}): Promise<{
  readonly items: readonly SiteGalleryImageRow[];
  readonly total: number;
}> {
  const column = sortColumn(input.sort);
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.publishedOnly) {
    where.push("published_at IS NOT NULL");
  }
  if (input.sectionKey !== undefined) {
    params.push(input.sectionKey);
    where.push(`section_key = $${params.length}`);
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(alt_text ILIKE $${params.length} OR image_path ILIKE $${params.length})`,
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
      FROM site_gallery_images_active
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
    items: result.rows.map((row) => parseRow(siteGalleryImageRowSchema, row)),
    total,
  };
}

export async function getActiveSiteGalleryImageById(
  id: string,
): Promise<SiteGalleryImageRow | null> {
  const result = await query(
    `
      SELECT ${COLUMNS}
      FROM site_gallery_images_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(siteGalleryImageRowSchema, row);
}

export async function insertSiteGalleryImage(
  input: SiteGalleryImageInsert,
  client: DbQueryable = pool,
): Promise<SiteGalleryImageRow> {
  const id = await nextUuidv7(client);

  await query(
    `
      INSERT INTO site_gallery_images (
        id, section_key, image_path, alt_text, sort_order, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      id,
      input.sectionKey,
      input.imagePath,
      input.altText,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  return getActiveByIdWithClient(id, client);
}

export async function updateSiteGalleryImage(
  input: SiteGalleryImageUpdate,
  client: DbQueryable = pool,
): Promise<SiteGalleryImageRow | null> {
  const result = await query(
    `
      UPDATE site_gallery_images
      SET
        section_key = $3,
        image_path = $4,
        alt_text = $5,
        sort_order = $6,
        published_at = $7,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.version,
      input.sectionKey,
      input.imagePath,
      input.altText,
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

export async function reorderSiteGalleryImages(
  items: readonly SiteGalleryImageReorderItem[],
  client: DbQueryable = pool,
): Promise<boolean> {
  for (const item of items) {
    const result = await query(
      `
        UPDATE site_gallery_images
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

export async function archiveSiteGalleryImage(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE site_gallery_images
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

export async function restoreSiteGalleryImage(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<SiteGalleryImageRow | null> {
  const result = await query(
    `
      UPDATE site_gallery_images
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

async function getSiteGalleryImageByIdFromBase(
  id: string,
  client?: DbQueryable,
): Promise<SiteGalleryImageRow | null> {
  const result = await query(
    `
      SELECT ${COLUMNS}
      FROM site_gallery_images
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

  return parseRow(siteGalleryImageRowSchema, row);
}

export { getSiteGalleryImageByIdFromBase };
