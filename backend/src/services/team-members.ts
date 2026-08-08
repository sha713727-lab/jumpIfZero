import {
  listQuerySchema,
  teamListResponseSchema,
  teamMemberArchiveSchema,
  teamMemberCreateSchema,
  teamMemberReorderSchema,
  teamMemberRestoreSchema,
  teamMemberUpdateSchema,
  type Actor,
  type TeamMemberWithSocialsRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { NotFoundError } from "../lib/errors.ts";
import { withTransaction } from "../db/transaction.ts";
import * as teamRepo from "../repositories/team-members.ts";
import {
  parseInput,
  requireAdmin,
  resolveVersionWrite,
  toDateOrNull,
} from "./_helpers.ts";

function assertPublished(
  row: TeamMemberWithSocialsRow,
  publishedOnly: boolean,
): TeamMemberWithSocialsRow {
  if (publishedOnly && row.published_at === null) {
    throw new NotFoundError("Team member not found");
  }
  return row;
}

export async function listTeamMembers(
  input: unknown,
  publishedOnly: boolean,
): Promise<unknown> {
  const query = parseInput(listQuerySchema, input);
  const useSortOrderDefault = query.sort === "updated_at";
  const sort = useSortOrderDefault
    ? "sort_order"
    : query.sort === "title" || query.sort === "slug"
      ? "sort_order"
      : query.sort;
  const dir = useSortOrderDefault ? "asc" : query.dir;
  const result = await teamRepo.listActiveTeamMembers({
    limit: query.limit,
    offset: query.offset,
    publishedOnly,
    sort,
    dir,
    ...(query.q !== undefined ? { q: query.q } : {}),
  });
  return teamListResponseSchema.parse({
    items: result.items,
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getTeamMemberById(
  id: string,
  publishedOnly: boolean,
): Promise<TeamMemberWithSocialsRow> {
  const row = await teamRepo.getActiveTeamMemberById(id);
  if (row === null) {
    throw new NotFoundError("Team member not found");
  }
  return assertPublished(row, publishedOnly);
}

export async function createTeamMember(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<TeamMemberWithSocialsRow> {
  requireAdmin(actor);
  const body = parseInput(teamMemberCreateSchema, input);
  const row = await teamRepo.insertTeamMember({
    name: body.name,
    roleTitle: body.roleTitle,
    bio: body.bio,
    imagePath: body.imagePath,
    employeeId: body.employeeId,
    sortOrder: body.sortOrder,
    publishedAt: toDateOrNull(body.publishedAt),
    socials: body.socials,
  });
  audit({
    action: "content.team.create",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.team.create",
  });
  return row;
}

export async function updateTeamMember(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<TeamMemberWithSocialsRow> {
  requireAdmin(actor);
  const body = parseInput(teamMemberUpdateSchema, input);
  const updated = await teamRepo.updateTeamMember({
    id: body.id,
    version: body.version,
    name: body.name,
    roleTitle: body.roleTitle,
    bio: body.bio,
    imagePath: body.imagePath,
    employeeId: body.employeeId,
    sortOrder: body.sortOrder,
    publishedAt: toDateOrNull(body.publishedAt),
    socials: body.socials,
  });

  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => teamRepo.getTeamMemberByIdFromBase(body.id),
    notFoundMessage: "Team member not found",
    conflictMessage: "Team member version conflict",
  });
  const withSocials = await teamRepo.getActiveTeamMemberById(row.id);
  if (withSocials === null) {
    throw new NotFoundError("Team member not found");
  }
  audit({
    action: "content.team.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.team.update",
  });
  return withSocials;
}

export async function reorderTeamMembers(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(teamMemberReorderSchema, input);
  const first = body.items[0];
  if (first === undefined) {
    return;
  }

  const reordered = await withTransaction((client) =>
    teamRepo.reorderTeamMembers(
      body.items.map((item) => ({
        id: item.id,
        sortOrder: item.sortOrder,
        version: item.version,
      })),
      client,
    ),
  );

  await resolveVersionWrite({
    result: reordered ? true : null,
    lookup: () => teamRepo.getTeamMemberByIdFromBase(first.id),
    notFoundMessage: "Team member not found",
    conflictMessage: "Team member version conflict",
  });
  audit({
    action: "content.team.reorder",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.team.reorder",
  });
}

export async function archiveTeamMember(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(teamMemberArchiveSchema, input);
  const archived = await teamRepo.archiveTeamMember({
    id: body.id,
    version: body.version,
  });

  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () => teamRepo.getTeamMemberByIdFromBase(body.id),
    notFoundMessage: "Team member not found",
    conflictMessage: "Team member version conflict",
  });
  audit({
    action: "content.team.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.team.archive",
  });
}

export async function restoreTeamMember(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<TeamMemberWithSocialsRow> {
  requireAdmin(actor);
  const body = parseInput(teamMemberRestoreSchema, input);
  const restored = await teamRepo.restoreTeamMember({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => teamRepo.getTeamMemberByIdFromBase(body.id),
    notFoundMessage: "Team member not found",
    conflictMessage: "Team member version conflict",
  });
  audit({
    action: "content.team.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.team.restore",
  });
  return row;
}
