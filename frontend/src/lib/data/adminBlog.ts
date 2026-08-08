import {
  blogListResponseSchema,
  blogPostCreateSchema,
  blogPostUpdateSchema,
  type Actor,
} from "@jumpifzero/contracts/content";
import {
  blogPostRowSchema,
  type BlogPostListRow,
  type BlogPostRow,
} from "@jumpifzero/contracts/db-content";
import type { AdminBlogPost } from "@jumpifzero/contracts/admin";
import { z } from "@jumpifzero/contracts/z";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function toAdminBlogPostBase(
  row: BlogPostListRow | BlogPostRow,
  body: string,
): AdminBlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body,
    image: row.image_path,
    category: row.category,
    active: row.published_at !== null,
    version: row.version,
    publishedAt:
      row.published_at === null ? null : row.published_at.toISOString(),
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

export function toAdminBlogPost(row: BlogPostRow): AdminBlogPost {
  return toAdminBlogPostBase(row, row.body);
}

function toAdminBlogPostFromList(row: BlogPostListRow): AdminBlogPost {
  return toAdminBlogPostBase(row, "");
}

export async function listAdminBlogPosts(
  actor: Actor,
): Promise<AdminBlogPost[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/content/blog",
    query: { limit: "100", publishedOnly: "false" },
    actor,
    outputSchema: blogListResponseSchema,
  });
  return response.items.map(toAdminBlogPostFromList);
}

export async function getAdminBlogPost(
  actor: Actor,
  id: string,
): Promise<AdminBlogPost> {
  const row = await backendRequest({
    method: "GET",
    path: `/content/blog/${id}`,
    actor,
    outputSchema: blogPostRowSchema,
  });
  return toAdminBlogPost(row);
}

export async function createAdminBlogPost(
  actor: Actor,
  input: {
    readonly title: string;
    readonly slug: string;
    readonly excerpt: string;
    readonly body: string;
    readonly image: string;
    readonly category: string;
    readonly active: boolean;
  },
): Promise<AdminBlogPost> {
  const body = blogPostCreateSchema.parse({
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    body: input.body,
    imagePath: input.image,
    category: input.category,
    publishedAt: input.active ? new Date().toISOString() : null,
  });

  const row = await backendRequest({
    method: "POST",
    path: "/content/blog",
    body,
    actor,
    outputSchema: blogPostRowSchema,
  });

  return toAdminBlogPost(row);
}

export async function updateAdminBlogPost(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly title: string;
    readonly slug: string;
    readonly excerpt: string;
    readonly body: string;
    readonly image: string;
    readonly category: string;
    readonly active: boolean;
    readonly publishedAt: string | null;
  },
): Promise<AdminBlogPost> {
  const body = blogPostUpdateSchema.parse({
    id: input.id,
    version: input.version,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    body: input.body,
    imagePath: input.image,
    category: input.category,
    publishedAt: input.active
      ? (input.publishedAt ?? new Date().toISOString())
      : null,
  });

  const row = await backendRequest({
    method: "PATCH",
    path: `/content/blog/${input.id}`,
    body,
    actor,
    outputSchema: blogPostRowSchema,
  });

  return toAdminBlogPost(row);
}

export async function archiveAdminBlogPost(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/blog/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}
