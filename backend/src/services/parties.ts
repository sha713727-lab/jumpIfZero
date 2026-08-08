import {
  partyArchiveSchema,
  partyCreateSchema,
  partyPublicSchema,
  partyRestoreSchema,
  partiesListQuerySchema,
  partiesListResponseSchema,
  partyUpdateSchema,
  type Actor,
  type PartyPublic,
  type PartyRow,
} from "@jumpifzero/contracts";
import { withTransaction } from "../db/transaction.ts";
import { NotFoundError } from "../lib/errors.ts";
import * as partiesRepo from "../repositories/parties.ts";
import { parseInput, resolveVersionWrite } from "./_helpers.ts";
import { requireCrmAccess } from "./crm-access.ts";

function toPublic(row: PartyRow): PartyPublic {
  return partyPublicSchema.parse({
    id: row.id,
    kind: row.kind,
    name: row.name,
    phone: row.phone,
    street: row.street,
    cityStateZip: row.city_state_zip,
    email: row.email,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt:
      row.archived_at === null ? null : row.archived_at.toISOString(),
  });
}

export async function listParties(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  await requireCrmAccess(actor);
  const query = parseInput(partiesListQuerySchema, input);
  const result = await partiesRepo.listParties({
    limit: query.limit,
    offset: query.offset,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.kind !== undefined ? { kind: query.kind } : {}),
    archived: query.archived,
    sort: query.sort,
    dir: query.dir,
  });
  return partiesListResponseSchema.parse({
    items: result.items.map(toPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getParty(
  actor: Actor,
  id: string,
): Promise<PartyPublic> {
  await requireCrmAccess(actor);
  const row =
    actor.role === "admin"
      ? await partiesRepo.getPartyById(id)
      : await partiesRepo.getActivePartyById(id);
  if (row === null) {
    throw new NotFoundError("Party not found");
  }
  return toPublic(row);
}

export async function createParty(
  actor: Actor,
  input: unknown,
): Promise<PartyPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(partyCreateSchema, input);
  const row = await partiesRepo.insertParty({
    kind: body.kind,
    name: body.name,
    phone: body.phone,
    street: body.street,
    cityStateZip: body.cityStateZip,
    email: body.email,
  });
  return toPublic(row);
}

export async function updateParty(
  actor: Actor,
  input: unknown,
): Promise<PartyPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(partyUpdateSchema, input);
  const updated = await partiesRepo.updateParty({
    id: body.id,
    version: body.version,
    name: body.name,
    phone: body.phone,
    street: body.street,
    cityStateZip: body.cityStateZip,
    email: body.email,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => partiesRepo.getPartyById(body.id),
    notFoundMessage: "Party not found",
    conflictMessage: "Party version conflict",
  });
  return toPublic(row);
}

export async function archiveParty(
  actor: Actor,
  input: unknown,
): Promise<PartyPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(partyArchiveSchema, input);
  const row = await withTransaction(async (tx) => {
    const archived = await partiesRepo.archiveParty(
      { id: body.id, version: body.version },
      tx,
    );
    const party = await resolveVersionWrite({
      result: archived,
      lookup: () => partiesRepo.getPartyById(body.id, tx),
      notFoundMessage: "Party not found",
      conflictMessage: "Party version conflict",
    });
    await partiesRepo.nullifyPartyReferencesOnActiveSales(body.id, tx);
    return party;
  });
  return toPublic(row);
}

export async function restoreParty(
  actor: Actor,
  input: unknown,
): Promise<PartyPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(partyRestoreSchema, input);
  const restored = await partiesRepo.restoreParty({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => partiesRepo.getPartyById(body.id),
    notFoundMessage: "Party not found",
    conflictMessage: "Party version conflict",
  });
  return toPublic(row);
}
