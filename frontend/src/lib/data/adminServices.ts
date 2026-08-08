import {
  serviceCreateSchema,
  serviceUpdateSchema,
  servicesListResponseSchema,
  type Actor,
} from "@jumpifzero/contracts/content";
import {
  serviceRowSchema,
  type ServiceRow,
} from "@jumpifzero/contracts/db-content";
import type { AdminService } from "@jumpifzero/contracts/admin";
import { z } from "@jumpifzero/contracts/z";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function toAdminService(row: ServiceRow): AdminService {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    path: row.path,
    image: row.image_path,
    active: row.published_at !== null,
    version: row.version,
    publishedAt:
      row.published_at === null ? null : row.published_at.toISOString(),
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

export async function listAdminServices(
  actor: Actor,
): Promise<AdminService[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/content/services",
    query: { limit: "100", publishedOnly: "false" },
    actor,
    outputSchema: servicesListResponseSchema,
  });
  return response.items.map(toAdminService);
}

export async function createAdminService(
  actor: Actor,
  input: {
    readonly title: string;
    readonly slug: string;
    readonly description: string;
    readonly path: string;
    readonly image: string;
    readonly active: boolean;
  },
): Promise<AdminService> {
  const body = serviceCreateSchema.parse({
    title: input.title,
    slug: input.slug,
    description: input.description,
    path: input.path,
    imagePath: input.image,
    publishedAt: input.active ? new Date().toISOString() : null,
  });

  const row = await backendRequest({
    method: "POST",
    path: "/content/services",
    body,
    actor,
    outputSchema: serviceRowSchema,
  });

  return toAdminService(row);
}

export async function updateAdminService(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly title: string;
    readonly slug: string;
    readonly description: string;
    readonly path: string;
    readonly image: string;
    readonly active: boolean;
    readonly publishedAt: string | null;
  },
): Promise<AdminService> {
  const body = serviceUpdateSchema.parse({
    id: input.id,
    version: input.version,
    title: input.title,
    slug: input.slug,
    description: input.description,
    path: input.path,
    imagePath: input.image,
    publishedAt: input.active
      ? (input.publishedAt ?? new Date().toISOString())
      : null,
  });

  const row = await backendRequest({
    method: "PATCH",
    path: `/content/services/${input.id}`,
    body,
    actor,
    outputSchema: serviceRowSchema,
  });

  return toAdminService(row);
}

export async function archiveAdminService(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/services/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}
