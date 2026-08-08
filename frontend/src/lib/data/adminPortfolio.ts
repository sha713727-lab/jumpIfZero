import {
  portfolioItemCreateSchema,
  portfolioItemUpdateSchema,
  portfolioListResponseSchema,
  type Actor,
} from "@jumpifzero/contracts/content";
import {
  portfolioItemRowSchema,
  type PortfolioItemRow,
} from "@jumpifzero/contracts/db-content";
import type { AdminPortfolioItem } from "@jumpifzero/contracts/admin";
import { z } from "@jumpifzero/contracts/z";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function toAdminPortfolioItem(row: PortfolioItemRow): AdminPortfolioItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    summary: row.summary,
    image: row.image_path,
    active: row.published_at !== null,
    version: row.version,
    publishedAt:
      row.published_at === null ? null : row.published_at.toISOString(),
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

export async function listAdminPortfolio(
  actor: Actor,
): Promise<AdminPortfolioItem[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/content/portfolio",
    query: { limit: "100", publishedOnly: "false" },
    actor,
    outputSchema: portfolioListResponseSchema,
  });
  return response.items.map(toAdminPortfolioItem);
}

export async function createAdminPortfolio(
  actor: Actor,
  input: {
    readonly title: string;
    readonly slug: string;
    readonly category: string;
    readonly summary: string;
    readonly image: string;
    readonly active: boolean;
  },
): Promise<AdminPortfolioItem> {
  const body = portfolioItemCreateSchema.parse({
    title: input.title,
    slug: input.slug,
    category: input.category,
    summary: input.summary,
    imagePath: input.image,
    publishedAt: input.active ? new Date().toISOString() : null,
  });

  const row = await backendRequest({
    method: "POST",
    path: "/content/portfolio",
    body,
    actor,
    outputSchema: portfolioItemRowSchema,
  });

  return toAdminPortfolioItem(row);
}

export async function updateAdminPortfolio(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly title: string;
    readonly slug: string;
    readonly category: string;
    readonly summary: string;
    readonly image: string;
    readonly active: boolean;
    readonly publishedAt: string | null;
  },
): Promise<AdminPortfolioItem> {
  const body = portfolioItemUpdateSchema.parse({
    id: input.id,
    version: input.version,
    title: input.title,
    slug: input.slug,
    category: input.category,
    summary: input.summary,
    imagePath: input.image,
    publishedAt: input.active
      ? (input.publishedAt ?? new Date().toISOString())
      : null,
  });

  const row = await backendRequest({
    method: "PATCH",
    path: `/content/portfolio/${input.id}`,
    body,
    actor,
    outputSchema: portfolioItemRowSchema,
  });

  return toAdminPortfolioItem(row);
}

export async function archiveAdminPortfolio(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/portfolio/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}
