import {
  callbackArchiveSchema,
  callbackCreateSchema,
  callbackRestoreSchema,
  callbackUpdateSchema,
  callbacksListQuerySchema,
  callbacksListResponseSchema,
  type Actor,
  type CallbackRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { NotFoundError } from "../lib/errors.ts";
import * as callbacksRepo from "../repositories/callbacks.ts";
import { parseInput, requireAdmin, resolveVersionWrite } from "./_helpers.ts";

export async function createCallback(
  input: unknown,
  correlationId: string,
): Promise<CallbackRow> {
  const body = parseInput(callbackCreateSchema, input);
  const row = await callbacksRepo.insertCallback({
    name: body.name,
    email: body.email,
    phone: body.phone,
    note: body.note,
  });
  audit({
    action: "inbox.callback.create",
    correlationId,
    actorSubjectId: "gateway",
    route: "content.callbacks.create",
  });
  return row;
}

export async function listCallbacks(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  requireAdmin(actor);
  const query = parseInput(callbacksListQuerySchema, input);
  const result = await callbacksRepo.listActiveCallbacks({
    limit: query.limit,
    offset: query.offset,
    sort: query.sort,
    dir: query.dir,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.status !== undefined ? { status: query.status } : {}),
  });
  return callbacksListResponseSchema.parse({
    items: result.items,
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getCallbackById(
  actor: Actor,
  id: string,
): Promise<CallbackRow> {
  requireAdmin(actor);
  const row = await callbacksRepo.getActiveCallbackById(id);
  if (row === null) {
    throw new NotFoundError("Callback not found");
  }
  return row;
}

export async function updateCallbackStatus(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<CallbackRow> {
  requireAdmin(actor);
  const body = parseInput(callbackUpdateSchema, input);
  const updated = await callbacksRepo.updateCallbackStatus({
    id: body.id,
    version: body.version,
    status: body.status,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => callbacksRepo.getCallbackByIdFromBase(body.id),
    notFoundMessage: "Callback not found",
    conflictMessage: "Callback version conflict",
  });
  audit({
    action: "inbox.callback.status",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.callbacks.update",
  });
  return row;
}

export async function archiveCallback(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(callbackArchiveSchema, input);
  const archived = await callbacksRepo.archiveCallback({
    id: body.id,
    version: body.version,
  });
  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () => callbacksRepo.getCallbackByIdFromBase(body.id),
    notFoundMessage: "Callback not found",
    conflictMessage: "Callback version conflict",
  });
  audit({
    action: "inbox.callback.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.callbacks.archive",
  });
}

export async function restoreCallback(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<CallbackRow> {
  requireAdmin(actor);
  const body = parseInput(callbackRestoreSchema, input);
  const restored = await callbacksRepo.restoreCallback({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => callbacksRepo.getCallbackByIdFromBase(body.id),
    notFoundMessage: "Callback not found",
    conflictMessage: "Callback version conflict",
  });
  audit({
    action: "inbox.callback.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.callbacks.restore",
  });
  return row;
}
