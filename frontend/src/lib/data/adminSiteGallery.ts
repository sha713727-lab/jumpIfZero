import {
  siteGalleryImageCreateSchema,
  siteGalleryImageUpdateSchema,
  siteGalleryListResponseSchema,
  type Actor,
} from "@jumpifzero/contracts/content";
import {
  siteGalleryImageRowSchema,
  type SiteGalleryImageRow,
  type SiteGallerySectionKey,
} from "@jumpifzero/contracts/db-content";
import type { AdminSiteGalleryImage } from "@jumpifzero/contracts/admin";
import { z } from "@jumpifzero/contracts/z";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function toAdminSiteGalleryImage(
  row: SiteGalleryImageRow,
): AdminSiteGalleryImage {
  return {
    id: row.id,
    sectionKey: row.section_key,
    image: row.image_path,
    altText: row.alt_text,
    sortOrder: row.sort_order,
    active: row.published_at !== null,
    version: row.version,
    publishedAt:
      row.published_at === null ? null : row.published_at.toISOString(),
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

export async function listAdminSiteGallery(
  actor: Actor,
  sectionKey?: SiteGallerySectionKey,
): Promise<AdminSiteGalleryImage[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/content/site-gallery",
    query: {
      limit: "100",
      publishedOnly: "false",
      sort: "sort_order",
      dir: "asc",
      ...(sectionKey !== undefined ? { sectionKey } : {}),
    },
    actor,
    outputSchema: siteGalleryListResponseSchema,
  });
  return response.items.map(toAdminSiteGalleryImage);
}

export async function createAdminSiteGalleryImage(
  actor: Actor,
  input: {
    readonly sectionKey: SiteGallerySectionKey;
    readonly image: string;
    readonly altText: string;
    readonly sortOrder: number;
    readonly active: boolean;
  },
): Promise<AdminSiteGalleryImage> {
  const body = siteGalleryImageCreateSchema.parse({
    sectionKey: input.sectionKey,
    imagePath: input.image,
    altText: input.altText,
    sortOrder: input.sortOrder,
    publishedAt: input.active ? new Date().toISOString() : null,
  });

  const row = await backendRequest({
    method: "POST",
    path: "/content/site-gallery",
    body,
    actor,
    outputSchema: siteGalleryImageRowSchema,
  });

  return toAdminSiteGalleryImage(row);
}

export async function updateAdminSiteGalleryImage(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly sectionKey: SiteGallerySectionKey;
    readonly image: string;
    readonly altText: string;
    readonly sortOrder: number;
    readonly active: boolean;
    readonly publishedAt: string | null;
  },
): Promise<AdminSiteGalleryImage> {
  const body = siteGalleryImageUpdateSchema.parse({
    id: input.id,
    version: input.version,
    sectionKey: input.sectionKey,
    imagePath: input.image,
    altText: input.altText,
    sortOrder: input.sortOrder,
    publishedAt: input.active
      ? (input.publishedAt ?? new Date().toISOString())
      : null,
  });

  const row = await backendRequest({
    method: "PATCH",
    path: `/content/site-gallery/${input.id}`,
    body,
    actor,
    outputSchema: siteGalleryImageRowSchema,
  });

  return toAdminSiteGalleryImage(row);
}

export async function archiveAdminSiteGalleryImage(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/site-gallery/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}

export async function reorderAdminSiteGalleryImages(
  actor: Actor,
  items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[],
): Promise<void> {
  await backendRequest({
    method: "PUT",
    path: "/content/site-gallery/reorder",
    body: { items: [...items] },
    actor,
    outputSchema: z.null(),
  });
}
