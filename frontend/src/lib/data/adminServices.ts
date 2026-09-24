import {
  servicesListResponseSchema,
  type Actor,
} from "@jumpifzero/contracts/content";
import { type ServiceRow } from "@jumpifzero/contracts/db-content";
import type { AdminService } from "@jumpifzero/contracts/admin";
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
