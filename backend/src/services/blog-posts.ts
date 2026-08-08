import {
  blogListResponseSchema,
  blogPostArchiveSchema,
  blogPostCreateSchema,
  blogPostRestoreSchema,
  blogPostUpdateSchema,
  listQuerySchema,
  type Actor,
  type BlogPostRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { NotFoundError } from "../lib/errors.ts";
import * as blogRepo from "../repositories/blog-posts.ts";
import {
  parseInput,
  requireAdmin,
  resolveVersionWrite,
  toDateOrNull,
} from "./_helpers.ts";

function assertPublished(row: BlogPostRow, publishedOnly: boolean): BlogPostRow {
  if (publishedOnly && row.published_at === null) {
    throw new NotFoundError("Blog post not found");
  }
  return row;
}

export async function listBlogPosts(
  input: unknown,
  publishedOnly: boolean,
): Promise<unknown> {
  const query = parseInput(listQuerySchema, input);
  const sort =
    query.sort === "sort_order" ? "updated_at" : query.sort;
  const result = await blogRepo.listActiveBlogPosts({
    limit: query.limit,
    offset: query.offset,
    publishedOnly,
    sort,
    dir: query.dir,
    ...(query.q !== undefined ? { q: query.q } : {}),
  });
  return blogListResponseSchema.parse({
    items: result.items,
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getBlogPostById(
  id: string,
  publishedOnly: boolean,
): Promise<BlogPostRow> {
  const row = await blogRepo.getActiveBlogPostById(id);
  if (row === null) {
    throw new NotFoundError("Blog post not found");
  }
  return assertPublished(row, publishedOnly);
}

export async function getBlogPostBySlug(
  slug: string,
  publishedOnly: boolean,
): Promise<BlogPostRow> {
  const row = await blogRepo.getActiveBlogPostBySlug(slug);
  if (row === null) {
    throw new NotFoundError("Blog post not found");
  }
  return assertPublished(row, publishedOnly);
}

export async function createBlogPost(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<BlogPostRow> {
  requireAdmin(actor);
  const body = parseInput(blogPostCreateSchema, input);
  const row = await blogRepo.insertBlogPost({
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt,
    body: body.body,
    imagePath: body.imagePath,
    category: body.category,
    publishedAt: toDateOrNull(body.publishedAt),
  });
  audit({
    action: "content.blog.create",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.blog.create",
  });
  return row;
}

export async function updateBlogPost(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<BlogPostRow> {
  requireAdmin(actor);
  const body = parseInput(blogPostUpdateSchema, input);
  const updated = await blogRepo.updateBlogPost({
    id: body.id,
    version: body.version,
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt,
    body: body.body,
    imagePath: body.imagePath,
    category: body.category,
    publishedAt: toDateOrNull(body.publishedAt),
  });

  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => blogRepo.getBlogPostByIdFromBase(body.id),
    notFoundMessage: "Blog post not found",
    conflictMessage: "Blog post version conflict",
  });
  audit({
    action: "content.blog.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.blog.update",
  });
  return row;
}

export async function archiveBlogPost(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(blogPostArchiveSchema, input);
  const archived = await blogRepo.archiveBlogPost({
    id: body.id,
    version: body.version,
  });

  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () => blogRepo.getBlogPostByIdFromBase(body.id),
    notFoundMessage: "Blog post not found",
    conflictMessage: "Blog post version conflict",
  });
  audit({
    action: "content.blog.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.blog.archive",
  });
}

export async function restoreBlogPost(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<BlogPostRow> {
  requireAdmin(actor);
  const body = parseInput(blogPostRestoreSchema, input);
  const restored = await blogRepo.restoreBlogPost({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => blogRepo.getBlogPostByIdFromBase(body.id),
    notFoundMessage: "Blog post not found",
    conflictMessage: "Blog post version conflict",
  });
  audit({
    action: "content.blog.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.blog.restore",
  });
  return row;
}
