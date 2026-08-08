import {
  serviceRowSchema,
  type ServiceRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { pool } from "../db/pool.ts";
import { ConflictError, InternalError } from "../lib/errors.ts";
import { isPgCode, parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

const SERVICE_COLUMNS = `
  id, title, slug, description, path, image_path,
  published_at, version, created_at, updated_at
`;

export type ServiceInsert = {
  readonly title: string;
  readonly slug: string;
  readonly description: string;
  readonly path: string;
  readonly imagePath: string;
  readonly publishedAt: Date | null;
};

export type ServiceUpdate = {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly slug: string;
  readonly description: string;
  readonly path: string;
  readonly imagePath: string;
  readonly publishedAt: Date | null;
};

function serviceSortColumn(
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

async function getActiveServiceByIdWithClient(
  id: string,
  client: DbQueryable,
): Promise<ServiceRow> {
  const result = await query(
    `
      SELECT ${SERVICE_COLUMNS}
      FROM services_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("Service not visible after write");
  }

  return parseRow(serviceRowSchema, row);
}

export async function listActiveServices(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly publishedOnly: boolean;
  readonly sort: "created_at" | "updated_at" | "title" | "slug" | "published_at";
  readonly dir: "asc" | "desc";
}): Promise<{ readonly items: readonly ServiceRow[]; readonly total: number }> {
  const sortColumn = serviceSortColumn(input.sort);
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.publishedOnly) {
    where.push("published_at IS NOT NULL");
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(title ILIKE $${params.length} OR slug ILIKE $${params.length} OR description ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${SERVICE_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM services_active
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
    items: result.rows.map((row) => parseRow(serviceRowSchema, row)),
    total,
  };
}

export async function getActiveServiceById(
  id: string,
): Promise<ServiceRow | null> {
  const result = await query(
    `
      SELECT ${SERVICE_COLUMNS}
      FROM services_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(serviceRowSchema, row);
}

export async function getServiceByIdFromBase(
  id: string,
): Promise<ServiceRow | null> {
  const result = await query(
    `
      SELECT ${SERVICE_COLUMNS}
      FROM services
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(serviceRowSchema, row);
}

export async function getActiveServiceBySlug(
  slug: string,
): Promise<ServiceRow | null> {
  const result = await query(
    `
      SELECT ${SERVICE_COLUMNS}
      FROM services_active
      WHERE slug = $1
      LIMIT 1
    `,
    [slug],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(serviceRowSchema, row);
}

export async function insertService(
  input: ServiceInsert,
  client: DbQueryable = pool,
): Promise<ServiceRow> {
  const id = await nextUuidv7(client);

  try {
    await query(
      `
        INSERT INTO services (
          id, title, slug, description, path, image_path, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        id,
        input.title,
        input.slug,
        input.description,
        input.path,
        input.imagePath,
        input.publishedAt,
      ],
      client,
    );
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Service slug already exists");
    }
    throw err;
  }

  return getActiveServiceByIdWithClient(id, client);
}

export async function updateService(
  input: ServiceUpdate,
  client: DbQueryable = pool,
): Promise<ServiceRow | null> {
  try {
    const result = await query(
      `
        UPDATE services
        SET
          title = $3,
          slug = $4,
          description = $5,
          path = $6,
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
        input.description,
        input.path,
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
      throw new ConflictError("Service slug already exists");
    }
    throw err;
  }

  return getActiveServiceByIdWithClient(input.id, client);
}

export async function archiveService(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE services
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

export async function restoreService(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<ServiceRow | null> {
  const result = await query(
    `
      UPDATE services
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

  return getActiveServiceByIdWithClient(id, client);
}
