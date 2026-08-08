import {
  sitePrincipleCreateSchema,
  sitePrincipleUpdateSchema,
  sitePrinciplesListResponseSchema,
  type Actor,
} from "@jumpifzero/contracts/content";
import {
  sitePrincipleRowSchema,
  type SitePrincipleAccent,
  type SitePrincipleRow,
} from "@jumpifzero/contracts/db-content";
import type { AdminSitePrinciple } from "@jumpifzero/contracts/admin";
import { z } from "@jumpifzero/contracts/z";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function toAdminSitePrinciple(
  row: SitePrincipleRow,
): AdminSitePrinciple {
  return {
    id: row.id,
    indexLabel: row.index_label,
    title: row.title,
    body: row.body,
    accent: row.accent,
    image: row.image_path,
    imageAlt: row.image_alt,
    sortOrder: row.sort_order,
    active: row.published_at !== null,
    version: row.version,
    publishedAt:
      row.published_at === null ? null : row.published_at.toISOString(),
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

export async function listAdminSitePrinciples(
  actor: Actor,
): Promise<AdminSitePrinciple[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/content/site-principles",
    query: {
      limit: "100",
      publishedOnly: "false",
      sort: "sort_order",
      dir: "asc",
    },
    actor,
    outputSchema: sitePrinciplesListResponseSchema,
  });
  return response.items.map(toAdminSitePrinciple);
}

export async function createAdminSitePrinciple(
  actor: Actor,
  input: {
    readonly indexLabel: string;
    readonly title: string;
    readonly body: string;
    readonly accent: SitePrincipleAccent;
    readonly image: string;
    readonly imageAlt: string;
    readonly sortOrder: number;
    readonly active: boolean;
  },
): Promise<AdminSitePrinciple> {
  const body = sitePrincipleCreateSchema.parse({
    indexLabel: input.indexLabel,
    title: input.title,
    body: input.body,
    accent: input.accent,
    imagePath: input.image,
    imageAlt: input.imageAlt,
    sortOrder: input.sortOrder,
    publishedAt: input.active ? new Date().toISOString() : null,
  });

  const row = await backendRequest({
    method: "POST",
    path: "/content/site-principles",
    body,
    actor,
    outputSchema: sitePrincipleRowSchema,
  });

  return toAdminSitePrinciple(row);
}

export async function updateAdminSitePrinciple(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly indexLabel: string;
    readonly title: string;
    readonly body: string;
    readonly accent: SitePrincipleAccent;
    readonly image: string;
    readonly imageAlt: string;
    readonly sortOrder: number;
    readonly active: boolean;
    readonly publishedAt: string | null;
  },
): Promise<AdminSitePrinciple> {
  const body = sitePrincipleUpdateSchema.parse({
    id: input.id,
    version: input.version,
    indexLabel: input.indexLabel,
    title: input.title,
    body: input.body,
    accent: input.accent,
    imagePath: input.image,
    imageAlt: input.imageAlt,
    sortOrder: input.sortOrder,
    publishedAt: input.active
      ? (input.publishedAt ?? new Date().toISOString())
      : null,
  });

  const row = await backendRequest({
    method: "PATCH",
    path: `/content/site-principles/${input.id}`,
    body,
    actor,
    outputSchema: sitePrincipleRowSchema,
  });

  return toAdminSitePrinciple(row);
}

export async function archiveAdminSitePrinciple(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/site-principles/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}

export async function reorderAdminSitePrinciples(
  actor: Actor,
  items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[],
): Promise<void> {
  await backendRequest({
    method: "PUT",
    path: "/content/site-principles/reorder",
    body: { items: [...items] },
    actor,
    outputSchema: z.null(),
  });
}
