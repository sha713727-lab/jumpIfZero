import {
  siteTestimonialCreateSchema,
  siteTestimonialUpdateSchema,
  siteTestimonialsListResponseSchema,
  type Actor,
} from "@jumpifzero/contracts/content";
import {
  siteTestimonialRowSchema,
  type SiteTestimonialAccent,
  type SiteTestimonialRow,
} from "@jumpifzero/contracts/db-content";
import type { AdminSiteTestimonial } from "@jumpifzero/contracts/admin";
import { z } from "@jumpifzero/contracts/z";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function toAdminSiteTestimonial(
  row: SiteTestimonialRow,
): AdminSiteTestimonial {
  return {
    id: row.id,
    quote: row.quote,
    authorName: row.author_name,
    roleTitle: row.role_title,
    company: row.company,
    accent: row.accent,
    image: row.image_path,
    sortOrder: row.sort_order,
    active: row.published_at !== null,
    version: row.version,
    publishedAt:
      row.published_at === null ? null : row.published_at.toISOString(),
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

export async function listAdminSiteTestimonials(
  actor: Actor,
): Promise<AdminSiteTestimonial[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/content/site-testimonials",
    query: {
      limit: "100",
      publishedOnly: "false",
      sort: "sort_order",
      dir: "asc",
    },
    actor,
    outputSchema: siteTestimonialsListResponseSchema,
  });
  return response.items.map(toAdminSiteTestimonial);
}

export async function createAdminSiteTestimonial(
  actor: Actor,
  input: {
    readonly quote: string;
    readonly authorName: string;
    readonly roleTitle: string;
    readonly company: string;
    readonly accent: SiteTestimonialAccent;
    readonly image: string;
    readonly sortOrder: number;
    readonly active: boolean;
  },
): Promise<AdminSiteTestimonial> {
  const body = siteTestimonialCreateSchema.parse({
    quote: input.quote,
    authorName: input.authorName,
    roleTitle: input.roleTitle,
    company: input.company,
    accent: input.accent,
    imagePath: input.image,
    sortOrder: input.sortOrder,
    publishedAt: input.active ? new Date().toISOString() : null,
  });

  const row = await backendRequest({
    method: "POST",
    path: "/content/site-testimonials",
    body,
    actor,
    outputSchema: siteTestimonialRowSchema,
  });

  return toAdminSiteTestimonial(row);
}

export async function updateAdminSiteTestimonial(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly quote: string;
    readonly authorName: string;
    readonly roleTitle: string;
    readonly company: string;
    readonly accent: SiteTestimonialAccent;
    readonly image: string;
    readonly sortOrder: number;
    readonly active: boolean;
    readonly publishedAt: string | null;
  },
): Promise<AdminSiteTestimonial> {
  const body = siteTestimonialUpdateSchema.parse({
    id: input.id,
    version: input.version,
    quote: input.quote,
    authorName: input.authorName,
    roleTitle: input.roleTitle,
    company: input.company,
    accent: input.accent,
    imagePath: input.image,
    sortOrder: input.sortOrder,
    publishedAt: input.active
      ? (input.publishedAt ?? new Date().toISOString())
      : null,
  });

  const row = await backendRequest({
    method: "PATCH",
    path: `/content/site-testimonials/${input.id}`,
    body,
    actor,
    outputSchema: siteTestimonialRowSchema,
  });

  return toAdminSiteTestimonial(row);
}

export async function archiveAdminSiteTestimonial(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/site-testimonials/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}

export async function reorderAdminSiteTestimonials(
  actor: Actor,
  items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[],
): Promise<void> {
  await backendRequest({
    method: "PUT",
    path: "/content/site-testimonials/reorder",
    body: { items: [...items] },
    actor,
    outputSchema: z.null(),
  });
}
