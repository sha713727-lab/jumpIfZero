import {
  listQuerySchema,
  serviceArchiveSchema,
  serviceCreateSchema,
  serviceRestoreSchema,
  serviceUpdateSchema,
  servicesListResponseSchema,
  type Actor,
  type ServiceRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { NotFoundError } from "../lib/errors.ts";
import * as servicesRepo from "../repositories/services.ts";
import {
  parseInput,
  requireAdmin,
  resolveVersionWrite,
  toDateOrNull,
} from "./_helpers.ts";

function assertPublished(row: ServiceRow, publishedOnly: boolean): ServiceRow {
  if (publishedOnly && row.published_at === null) {
    throw new NotFoundError("Service not found");
  }
  return row;
}

export async function listServices(
  input: unknown,
  publishedOnly: boolean,
): Promise<unknown> {
  const query = parseInput(listQuerySchema, input);
  const sort =
    query.sort === "sort_order" ? "updated_at" : query.sort;
  const result = await servicesRepo.listActiveServices({
    limit: query.limit,
    offset: query.offset,
    publishedOnly,
    sort,
    dir: query.dir,
    ...(query.q !== undefined ? { q: query.q } : {}),
  });
  return servicesListResponseSchema.parse({
    items: result.items,
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getServiceById(
  id: string,
  publishedOnly: boolean,
): Promise<ServiceRow> {
  const row = await servicesRepo.getActiveServiceById(id);
  if (row === null) {
    throw new NotFoundError("Service not found");
  }
  return assertPublished(row, publishedOnly);
}

export async function getServiceBySlug(
  slug: string,
  publishedOnly: boolean,
): Promise<ServiceRow> {
  const row = await servicesRepo.getActiveServiceBySlug(slug);
  if (row === null) {
    throw new NotFoundError("Service not found");
  }
  return assertPublished(row, publishedOnly);
}

export async function createService(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<ServiceRow> {
  requireAdmin(actor);
  const body = parseInput(serviceCreateSchema, input);
  const row = await servicesRepo.insertService({
    title: body.title,
    slug: body.slug,
    description: body.description,
    path: body.path,
    imagePath: body.imagePath,
    publishedAt: toDateOrNull(body.publishedAt),
  });
  audit({
    action: "content.service.create",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.services.create",
  });
  return row;
}

export async function updateService(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<ServiceRow> {
  requireAdmin(actor);
  const body = parseInput(serviceUpdateSchema, input);
  const updated = await servicesRepo.updateService({
    id: body.id,
    version: body.version,
    title: body.title,
    slug: body.slug,
    description: body.description,
    path: body.path,
    imagePath: body.imagePath,
    publishedAt: toDateOrNull(body.publishedAt),
  });

  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => servicesRepo.getServiceByIdFromBase(body.id),
    notFoundMessage: "Service not found",
    conflictMessage: "Service version conflict",
  });
  audit({
    action: "content.service.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.services.update",
  });
  return row;
}

export async function archiveService(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(serviceArchiveSchema, input);
  const archived = await servicesRepo.archiveService({
    id: body.id,
    version: body.version,
  });

  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () => servicesRepo.getServiceByIdFromBase(body.id),
    notFoundMessage: "Service not found",
    conflictMessage: "Service version conflict",
  });
  audit({
    action: "content.service.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.services.archive",
  });
}

export async function restoreService(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<ServiceRow> {
  requireAdmin(actor);
  const body = parseInput(serviceRestoreSchema, input);
  const restored = await servicesRepo.restoreService({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => servicesRepo.getServiceByIdFromBase(body.id),
    notFoundMessage: "Service not found",
    conflictMessage: "Service version conflict",
  });
  audit({
    action: "content.service.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.services.restore",
  });
  return row;
}
