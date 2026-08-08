import {
  blogPostListRowSchema,
  blogPostRowSchema,
  type BlogPostListRow,
  type BlogPostRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { pool } from "../db/pool.ts";
import { ConflictError, InternalError } from "../lib/errors.ts";
import { isPgCode, parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

const BLOG_LIST_COLUMNS = `
  id, title, slug, excerpt, image_path, category,
  published_at, version, created_at, updated_at
`;

const BLOG_DETAIL_COLUMNS = `
  ${BLOG_LIST_COLUMNS}, body
`;

export type BlogPostInsert = {
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly body: string;
  readonly imagePath: string;
  readonly category: string;
  readonly publishedAt: Date | null;
};

export type BlogPostUpdate = {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly body: string;
  readonly imagePath: string;
  readonly category: string;
  readonly publishedAt: Date | null;
};

function blogSortColumn(
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

async function getActiveBlogPostByIdWithClient(
  id: string,
  client: DbQueryable,
): Promise<BlogPostRow> {
  const result = await query(
    `
      SELECT ${BLOG_DETAIL_COLUMNS}
      FROM blog_posts_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("Blog post not visible after write");
  }

  return parseRow(blogPostRowSchema, row);
}

export async function listActiveBlogPosts(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly publishedOnly: boolean;
  readonly sort: "created_at" | "updated_at" | "title" | "slug" | "published_at";
  readonly dir: "asc" | "desc";
}): Promise<{
  readonly items: readonly BlogPostListRow[];
  readonly total: number;
}> {
  const sortColumn = blogSortColumn(input.sort);
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.publishedOnly) {
    where.push("published_at IS NOT NULL");
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(title ILIKE $${params.length} OR slug ILIKE $${params.length} OR excerpt ILIKE $${params.length} OR category ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${BLOG_LIST_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM blog_posts_active
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
    items: result.rows.map((row) => parseRow(blogPostListRowSchema, row)),
    total,
  };
}

export async function getActiveBlogPostById(
  id: string,
): Promise<BlogPostRow | null> {
  const result = await query(
    `
      SELECT ${BLOG_DETAIL_COLUMNS}
      FROM blog_posts_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(blogPostRowSchema, row);
}

export async function getBlogPostByIdFromBase(
  id: string,
): Promise<BlogPostRow | null> {
  const result = await query(
    `
      SELECT ${BLOG_DETAIL_COLUMNS}
      FROM blog_posts
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(blogPostRowSchema, row);
}

export async function getActiveBlogPostBySlug(
  slug: string,
): Promise<BlogPostRow | null> {
  const result = await query(
    `
      SELECT ${BLOG_DETAIL_COLUMNS}
      FROM blog_posts_active
      WHERE slug = $1
      LIMIT 1
    `,
    [slug],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(blogPostRowSchema, row);
}

export async function insertBlogPost(
  input: BlogPostInsert,
  client: DbQueryable = pool,
): Promise<BlogPostRow> {
  const id = await nextUuidv7(client);

  try {
    await query(
      `
        INSERT INTO blog_posts (
          id, title, slug, excerpt, body, image_path, category, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        id,
        input.title,
        input.slug,
        input.excerpt,
        input.body,
        input.imagePath,
        input.category,
        input.publishedAt,
      ],
      client,
    );
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Blog post slug already exists");
    }
    throw err;
  }

  return getActiveBlogPostByIdWithClient(id, client);
}

export async function updateBlogPost(
  input: BlogPostUpdate,
  client: DbQueryable = pool,
): Promise<BlogPostRow | null> {
  try {
    const result = await query(
      `
        UPDATE blog_posts
        SET
          title = $3,
          slug = $4,
          excerpt = $5,
          body = $6,
          image_path = $7,
          category = $8,
          published_at = $9,
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
        input.excerpt,
        input.body,
        input.imagePath,
        input.category,
        input.publishedAt,
      ],
      client,
    );

    if ((result.rowCount ?? 0) === 0) {
      return null;
    }
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Blog post slug already exists");
    }
    throw err;
  }

  return getActiveBlogPostByIdWithClient(input.id, client);
}

export async function archiveBlogPost(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE blog_posts
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

export async function restoreBlogPost(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<BlogPostRow | null> {
  const result = await query(
    `
      UPDATE blog_posts
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

  return getActiveBlogPostByIdWithClient(id, client);
}
