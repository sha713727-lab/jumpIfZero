import {
  leadArchiveSchema,
  leadCreateSchema,
  leadPublicSchema,
  leadRestoreSchema,
  leadsListQuerySchema,
  leadsListResponseSchema,
  leadStatusChangeSchema,
  leadUpdateSchema,
  type Actor,
  type LeadPublic,
  type LeadRow,
} from "@jumpifzero/contracts";
import { BadRequestError, NotFoundError } from "../lib/errors.ts";
import * as employeesRepo from "../repositories/employees.ts";
import * as leadsRepo from "../repositories/leads.ts";
import { parseInput, resolveVersionWrite } from "./_helpers.ts";
import {
  assertOwnsRep,
  getSalesEmployeeId,
  requireCrmAccess,
  resolveRepScope,
} from "./crm-access.ts";

function toPublic(row: LeadRow): LeadPublic {
  return leadPublicSchema.parse({
    id: row.id,
    repId: row.rep_id,
    company: row.company,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    source: row.source,
    statusCode: row.status_code,
    notes: row.notes,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt:
      row.archived_at === null ? null : row.archived_at.toISOString(),
  });
}

async function resolveRepIdForCreate(
  actor: Actor,
  repId: string | undefined,
): Promise<string> {
  if (actor.role === "admin") {
    if (repId === undefined) {
      throw new BadRequestError("repId is required");
    }
    const count = await employeesRepo.countActiveSalesEmployees([repId]);
    if (count !== 1) {
      throw new BadRequestError("repId must be an active sales employee");
    }
    return repId;
  }
  return getSalesEmployeeId(actor);
}

export async function listLeads(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  await requireCrmAccess(actor);
  const query = parseInput(leadsListQuerySchema, input);
  const scope = await resolveRepScope(actor);
  const repIds = scope === "all" ? "all" : [scope];
  const result = await leadsRepo.listLeads({
    limit: query.limit,
    offset: query.offset,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.status !== undefined ? { status: query.status } : {}),
    ...(query.repId !== undefined ? { repId: query.repId } : {}),
    repIds,
    archived: query.archived,
    sort: query.sort,
    dir: query.dir,
  });
  return leadsListResponseSchema.parse({
    items: result.items.map(toPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getLead(
  actor: Actor,
  id: string,
): Promise<LeadPublic> {
  await requireCrmAccess(actor);
  const scope = await resolveRepScope(actor);
  const row =
    actor.role === "admin"
      ? await leadsRepo.getLeadById(id)
      : await leadsRepo.getActiveLeadById(id);
  if (row === null) {
    throw new NotFoundError("Lead not found");
  }
  assertOwnsRep(scope, row.rep_id);
  return toPublic(row);
}

export async function createLead(
  actor: Actor,
  input: unknown,
): Promise<LeadPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(leadCreateSchema, input);
  const repId = await resolveRepIdForCreate(actor, body.repId);
  const row = await leadsRepo.insertLead({
    repId,
    company: body.company,
    contactName: body.contactName,
    phone: body.phone,
    email: body.email,
    source: body.source,
    statusCode: body.statusCode,
    notes: body.notes,
  });
  return toPublic(row);
}

export async function updateLead(
  actor: Actor,
  input: unknown,
): Promise<LeadPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(leadUpdateSchema, input);
  const scope = await resolveRepScope(actor);
  const existing = await leadsRepo.getActiveLeadById(body.id);
  if (existing === null) {
    throw new NotFoundError("Lead not found");
  }
  assertOwnsRep(scope, existing.rep_id);
  const updated = await leadsRepo.updateLead({
    id: body.id,
    version: body.version,
    company: body.company,
    contactName: body.contactName,
    phone: body.phone,
    email: body.email,
    source: body.source,
    notes: body.notes,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => leadsRepo.getLeadById(body.id),
    notFoundMessage: "Lead not found",
    conflictMessage: "Lead version conflict",
  });
  return toPublic(row);
}

export async function changeLeadStatus(
  actor: Actor,
  input: unknown,
): Promise<LeadPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(leadStatusChangeSchema, input);
  const scope = await resolveRepScope(actor);
  const existing = await leadsRepo.getActiveLeadById(body.id);
  if (existing === null) {
    throw new NotFoundError("Lead not found");
  }
  assertOwnsRep(scope, existing.rep_id);
  const updated = await leadsRepo.updateLeadStatus({
    id: body.id,
    version: body.version,
    statusCode: body.statusCode,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => leadsRepo.getLeadById(body.id),
    notFoundMessage: "Lead not found",
    conflictMessage: "Lead version conflict",
  });
  return toPublic(row);
}

export async function archiveLead(
  actor: Actor,
  input: unknown,
): Promise<LeadPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(leadArchiveSchema, input);
  const scope = await resolveRepScope(actor);
  const existing = await leadsRepo.getActiveLeadById(body.id);
  if (existing === null) {
    throw new NotFoundError("Lead not found");
  }
  assertOwnsRep(scope, existing.rep_id);
  const archived = await leadsRepo.archiveLead({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: archived,
    lookup: () => leadsRepo.getLeadById(body.id),
    notFoundMessage: "Lead not found",
    conflictMessage: "Lead version conflict",
  });
  return toPublic(row);
}

export async function restoreLead(
  actor: Actor,
  input: unknown,
): Promise<LeadPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(leadRestoreSchema, input);
  const scope = await resolveRepScope(actor);
  const existing = await leadsRepo.getLeadById(body.id);
  if (existing === null) {
    throw new NotFoundError("Lead not found");
  }
  assertOwnsRep(scope, existing.rep_id);
  const restored = await leadsRepo.restoreLead({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => leadsRepo.getLeadById(body.id),
    notFoundMessage: "Lead not found",
    conflictMessage: "Lead version conflict",
  });
  return toPublic(row);
}
