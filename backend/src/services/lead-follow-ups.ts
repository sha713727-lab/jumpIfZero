import {
  idParamSchema,
  leadFollowUpCreateSchema,
  leadFollowUpPublicSchema,
  leadFollowUpsListQuerySchema,
  leadFollowUpsListResponseSchema,
  leadFollowUpUpdateSchema,
  type Actor,
  type LeadFollowUpPublic,
  type LeadFollowUpRow,
} from "@jumpifzero/contracts";
import { NotFoundError } from "../lib/errors.ts";
import * as followUpsRepo from "../repositories/lead-follow-ups.ts";
import * as leadsRepo from "../repositories/leads.ts";
import { parseInput } from "./_helpers.ts";
import {
  assertOwnsRep,
  requireCrmAccess,
  resolveRepScope,
} from "./crm-access.ts";

function toPublic(row: LeadFollowUpRow): LeadFollowUpPublic {
  return leadFollowUpPublicSchema.parse({
    id: row.id,
    leadId: row.lead_id,
    occurredAt: row.occurred_at.toISOString(),
    note: row.note,
    outcome: row.outcome,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });
}

async function assertCanAccessLead(
  actor: Actor,
  leadId: string,
): Promise<void> {
  await requireCrmAccess(actor);
  const scope = await resolveRepScope(actor);
  const lead =
    actor.role === "admin"
      ? await leadsRepo.getLeadById(leadId)
      : await leadsRepo.getActiveLeadById(leadId);
  if (lead === null) {
    throw new NotFoundError("Lead not found");
  }
  assertOwnsRep(scope, lead.rep_id);
}

export async function listLeadFollowUps(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  const query = parseInput(leadFollowUpsListQuerySchema, input);
  await assertCanAccessLead(actor, query.leadId);
  const result = await followUpsRepo.listLeadFollowUps({
    leadId: query.leadId,
    limit: query.limit,
    offset: query.offset,
    sort: query.sort,
    dir: query.dir,
  });
  return leadFollowUpsListResponseSchema.parse({
    items: result.items.map(toPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function createLeadFollowUp(
  actor: Actor,
  input: unknown,
): Promise<LeadFollowUpPublic> {
  const body = parseInput(leadFollowUpCreateSchema, input);
  await assertCanAccessLead(actor, body.leadId);
  const row = await followUpsRepo.insertLeadFollowUp({
    leadId: body.leadId,
    occurredAt: new Date(body.occurredAt),
    note: body.note,
    outcome: body.outcome,
  });
  return toPublic(row);
}

export async function updateLeadFollowUp(
  actor: Actor,
  input: unknown,
): Promise<LeadFollowUpPublic> {
  const body = parseInput(leadFollowUpUpdateSchema, input);
  const existing = await followUpsRepo.getLeadFollowUpById(body.id);
  if (existing === null) {
    throw new NotFoundError("Lead follow-up not found");
  }
  await assertCanAccessLead(actor, existing.lead_id);
  const updated = await followUpsRepo.updateLeadFollowUp({
    id: body.id,
    occurredAt: new Date(body.occurredAt),
    note: body.note,
    outcome: body.outcome,
  });
  if (updated === null) {
    throw new NotFoundError("Lead follow-up not found");
  }
  return toPublic(updated);
}

export async function deleteLeadFollowUp(
  actor: Actor,
  id: string,
): Promise<void> {
  parseInput(idParamSchema, { id });
  const existing = await followUpsRepo.getLeadFollowUpById(id);
  if (existing === null) {
    throw new NotFoundError("Lead follow-up not found");
  }
  await assertCanAccessLead(actor, existing.lead_id);
  const deleted = await followUpsRepo.deleteLeadFollowUp(id);
  if (!deleted) {
    throw new NotFoundError("Lead follow-up not found");
  }
}
