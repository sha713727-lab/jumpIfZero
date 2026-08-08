import {
  assignmentPublicSchema,
  assignmentsListResponseSchema,
  clientArchiveSchema,
  clientAssignmentsPutSchema,
  clientCreateSchema,
  clientPublicSchema,
  clientRestoreSchema,
  clientSelfUpdateSchema,
  clientsListQuerySchema,
  clientsListResponseSchema,
  clientUpdateSchema,
  type Actor,
  type AssignmentRow,
  type ClientPublic,
  type ClientRow,
} from "@jumpifzero/contracts";
import { withTransaction } from "../db/transaction.ts";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../lib/errors.ts";
import { audit } from "../lib/audit.ts";
import * as assignmentsRepo from "../repositories/client-assignments.ts";
import * as clientsRepo from "../repositories/clients.ts";
import * as usersRepo from "../repositories/users.ts";
import {
  accessibleClientIds,
  assertCanAccessClient,
  getOwnClientId,
} from "./access.ts";
import { parseInput, requireAdmin, resolveVersionWrite } from "./_helpers.ts";

function dateOnly(value: Date): string {
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toPublic(
  row: ClientRow,
  assignedEmployeeIds?: readonly string[],
): ClientPublic {
  return clientPublicSchema.parse({
    id: row.id,
    userId: row.user_id,
    company: row.company,
    phone: row.phone,
    statusCode: row.status_code,
    memberSince: dateOnly(row.member_since),
    clientContactTitle: row.client_contact_title,
    location: row.location,
    plan: row.plan,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt:
      row.archived_at === null ? null : row.archived_at.toISOString(),
    ...(row.user_name !== undefined ? { userName: row.user_name } : {}),
    ...(row.user_email !== undefined ? { userEmail: row.user_email } : {}),
    ...(assignedEmployeeIds !== undefined
      ? { assignedEmployeeIds: [...assignedEmployeeIds] }
      : {}),
  });
}

function toAssignmentPublic(row: AssignmentRow) {
  return assignmentPublicSchema.parse({
    clientId: row.client_id,
    employeeId: row.employee_id,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });
}

export async function listClients(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  const query = parseInput(clientsListQuerySchema, input);
  const clientIds = await accessibleClientIds(actor);
  const result = await clientsRepo.listClients({
    limit: query.limit,
    offset: query.offset,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.status !== undefined ? { status: query.status } : {}),
    archived: query.archived,
    sort: query.sort,
    dir: query.dir,
    clientIds,
  });
  return clientsListResponseSchema.parse({
    items: result.items.map((row) => toPublic(row)),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getClient(
  actor: Actor,
  id: string,
): Promise<ClientPublic> {
  await assertCanAccessClient(actor, id);
  const row =
    actor.role === "admin"
      ? await clientsRepo.getClientById(id)
      : await clientsRepo.getActiveClientById(id);
  if (row === null) {
    throw new NotFoundError("Client not found");
  }
  const assignments = await assignmentsRepo.listAssignmentsByClientId(id);
  return toPublic(
    row,
    assignments.map((a) => a.employee_id),
  );
}

export async function getOwnClient(actor: Actor): Promise<ClientPublic> {
  if (actor.role !== "client") {
    throw new ForbiddenError();
  }
  const id = await getOwnClientId(actor);
  return getClient(actor, id);
}

export async function createClient(
  actor: Actor,
  input: unknown,
): Promise<ClientPublic> {
  requireAdmin(actor);
  const body = parseInput(clientCreateSchema, input);
  const user = await usersRepo.findActiveUserById(body.userId);
  if (user === null) {
    throw new BadRequestError("User not found");
  }
  if (user.role !== "client") {
    throw new ConflictError("User role must be client");
  }
  const row = await clientsRepo.insertClient({
    userId: body.userId,
    company: body.company,
    phone: body.phone,
    statusCode: body.statusCode,
    memberSince: body.memberSince ?? null,
    clientContactTitle: body.clientContactTitle,
    location: body.location,
    plan: body.plan,
  });
  return toPublic(row, []);
}

export async function updateClient(
  actor: Actor,
  input: unknown,
): Promise<ClientPublic> {
  requireAdmin(actor);
  const body = parseInput(clientUpdateSchema, input);
  const updated = await clientsRepo.updateClient({
    id: body.id,
    version: body.version,
    company: body.company,
    phone: body.phone,
    statusCode: body.statusCode,
    memberSince: body.memberSince,
    clientContactTitle: body.clientContactTitle,
    location: body.location,
    plan: body.plan,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => clientsRepo.getClientById(body.id),
    notFoundMessage: "Client not found",
    conflictMessage: "Client version conflict",
  });
  return toPublic(row);
}

export async function updateClientSelf(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<ClientPublic> {
  if (actor.role !== "client") {
    throw new ForbiddenError();
  }
  const body = parseInput(clientSelfUpdateSchema, input);
  const id = await getOwnClientId(actor);
  const updated = await clientsRepo.updateClientSelf({
    id,
    version: body.version,
    company: body.company,
    phone: body.phone,
    clientContactTitle: body.clientContactTitle,
    location: body.location,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => clientsRepo.getActiveClientById(id),
    notFoundMessage: "Client not found",
    conflictMessage: "Client version conflict",
  });
  audit({
    action: "client.profile.self_update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "clients.me.update",
  });
  const assignments = await assignmentsRepo.listAssignmentsByClientId(id);
  return toPublic(
    row,
    assignments.map((a) => a.employee_id),
  );
}

export async function archiveClient(
  actor: Actor,
  input: unknown,
): Promise<ClientPublic> {
  requireAdmin(actor);
  const body = parseInput(clientArchiveSchema, input);
  const archived = await clientsRepo.archiveClient({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: archived,
    lookup: () => clientsRepo.getClientById(body.id),
    notFoundMessage: "Client not found",
    conflictMessage: "Client version conflict",
  });
  return toPublic(row);
}

export async function restoreClient(
  actor: Actor,
  input: unknown,
): Promise<ClientPublic> {
  requireAdmin(actor);
  const body = parseInput(clientRestoreSchema, input);
  const restored = await clientsRepo.restoreClient({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => clientsRepo.getClientById(body.id),
    notFoundMessage: "Client not found",
    conflictMessage: "Client version conflict",
  });
  return toPublic(row);
}

export async function listAssignments(
  actor: Actor,
  clientId: string,
): Promise<unknown> {
  requireAdmin(actor);
  const client = await clientsRepo.getActiveClientById(clientId);
  if (client === null) {
    throw new NotFoundError("Client not found");
  }
  const items = await assignmentsRepo.listAssignmentsByClientId(clientId);
  return assignmentsListResponseSchema.parse({
    items: items.map(toAssignmentPublic),
  });
}

export async function putAssignments(
  actor: Actor,
  clientId: string,
  input: unknown,
): Promise<unknown> {
  requireAdmin(actor);
  const body = parseInput(clientAssignmentsPutSchema, input);
  const uniqueIds = [...new Set(body.employeeIds)];
  if (uniqueIds.length !== body.employeeIds.length) {
    throw new BadRequestError("Duplicate employee ids");
  }

  return withTransaction(async (tx) => {
    const client = await clientsRepo.getActiveClientById(clientId, tx);
    if (client === null) {
      throw new NotFoundError("Client not found");
    }
    const deliveryCount =
      await assignmentsRepo.countActiveDeliveryEmployees(uniqueIds, tx);
    if (deliveryCount !== uniqueIds.length) {
      throw new BadRequestError("All employees must be active delivery employees");
    }
    const items = await assignmentsRepo.replaceClientAssignments(
      { clientId, employeeIds: uniqueIds },
      tx,
    );
    return assignmentsListResponseSchema.parse({
      items: items.map(toAssignmentPublic),
    });
  });
}
