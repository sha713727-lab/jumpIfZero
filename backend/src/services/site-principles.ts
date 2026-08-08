import {
  listQuerySchema,
  sitePrincipleArchiveSchema,
  sitePrincipleCreateSchema,
  sitePrincipleReorderSchema,
  sitePrincipleRestoreSchema,
  sitePrincipleUpdateSchema,
  sitePrinciplesListResponseSchema,
  type Actor,
  type SitePrincipleRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { NotFoundError } from "../lib/errors.ts";
import { withTransaction } from "../db/transaction.ts";
import * as principlesRepo from "../repositories/site-principles.ts";
import {
  parseInput,
  requireAdmin,
  resolveVersionWrite,
  toDateOrNull,
} from "./_helpers.ts";

function assertPublished(
  row: SitePrincipleRow,
  publishedOnly: boolean,
): SitePrincipleRow {
  if (publishedOnly && row.published_at === null) {
    throw new NotFoundError("Site principle not found");
  }
  return row;
}

export async function listSitePrinciples(
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
  const result = await principlesRepo.listActiveSitePrinciples({
    limit: query.limit,
    offset: query.offset,
    publishedOnly,
    sort,
    dir,
    ...(query.q !== undefined ? { q: query.q } : {}),
  });
  return sitePrinciplesListResponseSchema.parse({
    items: result.items,
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getSitePrincipleById(
  id: string,
  publishedOnly: boolean,
): Promise<SitePrincipleRow> {
  const row = await principlesRepo.getActiveSitePrincipleById(id);
  if (row === null) {
    throw new NotFoundError("Site principle not found");
  }
  return assertPublished(row, publishedOnly);
}

export async function createSitePrinciple(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<SitePrincipleRow> {
  requireAdmin(actor);
  const body = parseInput(sitePrincipleCreateSchema, input);
  const row = await principlesRepo.insertSitePrinciple({
    indexLabel: body.indexLabel,
    title: body.title,
    body: body.body,
    accent: body.accent,
    imagePath: body.imagePath,
    imageAlt: body.imageAlt,
    sortOrder: body.sortOrder,
    publishedAt: toDateOrNull(body.publishedAt),
  });
  audit({
    action: "content.site_principles.create",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-principles.create",
  });
  return row;
}

export async function updateSitePrinciple(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<SitePrincipleRow> {
  requireAdmin(actor);
  const body = parseInput(sitePrincipleUpdateSchema, input);
  const updated = await principlesRepo.updateSitePrinciple({
    id: body.id,
    version: body.version,
    indexLabel: body.indexLabel,
    title: body.title,
    body: body.body,
    accent: body.accent,
    imagePath: body.imagePath,
    imageAlt: body.imageAlt,
    sortOrder: body.sortOrder,
    publishedAt: toDateOrNull(body.publishedAt),
  });

  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => principlesRepo.getSitePrincipleByIdFromBase(body.id),
    notFoundMessage: "Site principle not found",
    conflictMessage: "Site principle version conflict",
  });
  audit({
    action: "content.site_principles.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-principles.update",
  });
  return row;
}

export async function reorderSitePrinciples(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(sitePrincipleReorderSchema, input);
  const first = body.items[0];
  if (first === undefined) {
    return;
  }

  const reordered = await withTransaction((client) =>
    principlesRepo.reorderSitePrinciples(
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
    lookup: () => principlesRepo.getSitePrincipleByIdFromBase(first.id),
    notFoundMessage: "Site principle not found",
    conflictMessage: "Site principle version conflict",
  });
  audit({
    action: "content.site_principles.reorder",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-principles.reorder",
  });
}

export async function archiveSitePrinciple(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(sitePrincipleArchiveSchema, input);
  const archived = await principlesRepo.archiveSitePrinciple({
    id: body.id,
    version: body.version,
  });

  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () => principlesRepo.getSitePrincipleByIdFromBase(body.id),
    notFoundMessage: "Site principle not found",
    conflictMessage: "Site principle version conflict",
  });
  audit({
    action: "content.site_principles.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-principles.archive",
  });
}

export async function restoreSitePrinciple(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<SitePrincipleRow> {
  requireAdmin(actor);
  const body = parseInput(sitePrincipleRestoreSchema, input);
  const restored = await principlesRepo.restoreSitePrinciple({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => principlesRepo.getSitePrincipleByIdFromBase(body.id),
    notFoundMessage: "Site principle not found",
    conflictMessage: "Site principle version conflict",
  });
  audit({
    action: "content.site_principles.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-principles.restore",
  });
  return row;
}
