import {
  idParamSchema,
  salesMessageCreateSchema,
  salesMessagePublicSchema,
  salesMessagesListQuerySchema,
  salesMessagesListResponseSchema,
  type Actor,
  type SalesMessagePublic,
  type SalesMessageRow,
} from "@jumpifzero/contracts";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../lib/errors.ts";
import * as employeesRepo from "../repositories/employees.ts";
import * as messagesRepo from "../repositories/sales-messages.ts";
import { parseInput } from "./_helpers.ts";
import {
  getSalesEmployeeId,
  requireCrmAccess,
  resolveRepScope,
} from "./crm-access.ts";

function toPublic(row: SalesMessageRow): SalesMessagePublic {
  return salesMessagePublicSchema.parse({
    id: row.id,
    fromRepId: row.from_rep_id,
    toRepId: row.to_rep_id,
    body: row.body,
    sentAt: row.sent_at.toISOString(),
    readAt: row.read_at === null ? null : row.read_at.toISOString(),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });
}

function assertCanAccessMessage(
  scope: "all" | string,
  row: SalesMessageRow,
): void {
  if (scope === "all") {
    return;
  }
  if (scope !== row.from_rep_id && scope !== row.to_rep_id) {
    throw new ForbiddenError();
  }
}

export async function listSalesMessages(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  await requireCrmAccess(actor);
  const query = parseInput(salesMessagesListQuerySchema, input);
  const scope = await resolveRepScope(actor);
  const result = await messagesRepo.listSalesMessages({
    limit: query.limit,
    offset: query.offset,
    ...(query.peerRepId !== undefined ? { peerRepId: query.peerRepId } : {}),
    ...(query.q !== undefined ? { q: query.q } : {}),
    sort: query.sort,
    dir: query.dir,
    repScope: scope,
  });
  return salesMessagesListResponseSchema.parse({
    items: result.items.map(toPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function createSalesMessage(
  actor: Actor,
  input: unknown,
): Promise<SalesMessagePublic> {
  await requireCrmAccess(actor);
  if (actor.role === "admin") {
    throw new ForbiddenError();
  }
  const body = parseInput(salesMessageCreateSchema, input);
  const fromRepId = await getSalesEmployeeId(actor);

  if (fromRepId === body.toRepId) {
    throw new BadRequestError("Cannot message yourself");
  }

  const salesCount = await employeesRepo.countActiveSalesEmployees([
    body.toRepId,
  ]);
  if (salesCount !== 1) {
    throw new BadRequestError("toRepId must be an active sales employee");
  }

  const row = await messagesRepo.insertSalesMessage({
    fromRepId,
    toRepId: body.toRepId,
    body: body.body,
  });
  return toPublic(row);
}

export async function markSalesMessageRead(
  actor: Actor,
  id: string,
): Promise<SalesMessagePublic> {
  await requireCrmAccess(actor);
  parseInput(idParamSchema, { id });
  const scope = await resolveRepScope(actor);
  const existing = await messagesRepo.getSalesMessageById(id);
  if (existing === null) {
    throw new NotFoundError("Sales message not found");
  }
  assertCanAccessMessage(scope, existing);
  if (scope !== "all" && scope !== existing.to_rep_id) {
    throw new ForbiddenError();
  }
  const row = await messagesRepo.markSalesMessageRead(id);
  if (row === null) {
    throw new NotFoundError("Sales message not found");
  }
  return toPublic(row);
}

export async function deleteSalesMessage(
  actor: Actor,
  id: string,
): Promise<void> {
  await requireCrmAccess(actor);
  parseInput(idParamSchema, { id });
  const scope = await resolveRepScope(actor);
  const existing = await messagesRepo.getSalesMessageById(id);
  if (existing === null) {
    throw new NotFoundError("Sales message not found");
  }
  assertCanAccessMessage(scope, existing);
  const deleted = await messagesRepo.deleteSalesMessage(id);
  if (!deleted) {
    throw new NotFoundError("Sales message not found");
  }
}
