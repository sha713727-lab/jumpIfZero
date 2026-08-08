import {
  teamListResponseSchema,
  teamMemberCreateSchema,
  teamMemberUpdateSchema,
  type Actor,
} from "@jumpifzero/contracts/content";
import {
  teamMemberWithSocialsRowSchema,
  type TeamMemberWithSocialsRow,
} from "@jumpifzero/contracts/db-content";
import type {
  AdminTeamMember,
  AdminTeamMemberSocial,
} from "@jumpifzero/contracts/admin";
import { z } from "@jumpifzero/contracts/z";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function toAdminTeamMember(row: TeamMemberWithSocialsRow): AdminTeamMember {
  const socials: AdminTeamMemberSocial[] = row.socials.map((social) => ({
    network: social.network,
    label: social.label,
    href: social.href,
  }));

  return {
    id: row.id,
    name: row.name,
    role: row.role_title,
    bio: row.bio,
    image: row.image_path,
    active: row.published_at !== null,
    employeeId: row.employee_id,
    sortOrder: row.sort_order,
    version: row.version,
    publishedAt:
      row.published_at === null ? null : row.published_at.toISOString(),
    socials,
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

export async function listAdminTeamMembers(
  actor: Actor,
): Promise<AdminTeamMember[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/content/team",
    query: {
      limit: "100",
      publishedOnly: "false",
      sort: "sort_order",
      dir: "asc",
    },
    actor,
    outputSchema: teamListResponseSchema,
  });
  return response.items.map(toAdminTeamMember);
}

export async function createAdminTeamMember(
  actor: Actor,
  input: {
    readonly name: string;
    readonly role: string;
    readonly bio: string;
    readonly image: string;
    readonly employeeId: string | null;
    readonly sortOrder: number;
    readonly active: boolean;
    readonly socials: readonly AdminTeamMemberSocial[];
  },
): Promise<AdminTeamMember> {
  const body = teamMemberCreateSchema.parse({
    name: input.name,
    roleTitle: input.role,
    bio: input.bio,
    imagePath: input.image,
    employeeId: input.employeeId,
    sortOrder: input.sortOrder,
    publishedAt: input.active ? new Date().toISOString() : null,
    socials: input.socials,
  });

  const row = await backendRequest({
    method: "POST",
    path: "/content/team",
    body,
    actor,
    outputSchema: teamMemberWithSocialsRowSchema,
  });

  return toAdminTeamMember(row);
}

export async function updateAdminTeamMember(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly name: string;
    readonly role: string;
    readonly bio: string;
    readonly image: string;
    readonly employeeId: string | null;
    readonly sortOrder: number;
    readonly active: boolean;
    readonly publishedAt: string | null;
    readonly socials: readonly AdminTeamMemberSocial[];
  },
): Promise<AdminTeamMember> {
  const body = teamMemberUpdateSchema.parse({
    id: input.id,
    version: input.version,
    name: input.name,
    roleTitle: input.role,
    bio: input.bio,
    imagePath: input.image,
    employeeId: input.employeeId,
    sortOrder: input.sortOrder,
    publishedAt: input.active
      ? (input.publishedAt ?? new Date().toISOString())
      : null,
    socials: input.socials,
  });

  const row = await backendRequest({
    method: "PATCH",
    path: `/content/team/${input.id}`,
    body,
    actor,
    outputSchema: teamMemberWithSocialsRowSchema,
  });

  return toAdminTeamMember(row);
}

export async function archiveAdminTeamMember(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/team/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}

export async function reorderAdminTeamMembers(
  actor: Actor,
  items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[],
): Promise<void> {
  await backendRequest({
    method: "PUT",
    path: "/content/team/reorder",
    body: { items: [...items] },
    actor,
    outputSchema: z.null(),
  });
}
