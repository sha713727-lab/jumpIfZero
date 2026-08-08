import {
  carrierArchiveSchema,
  carrierCreateSchema,
  carrierPublicSchema,
  carrierRestoreSchema,
  carriersListQuerySchema,
  carriersListResponseSchema,
  carrierUpdateSchema,
  taxIdRevealResponseSchema,
  type Actor,
  type CarrierPublic,
  type CarrierRow,
} from "@jumpifzero/contracts";
import { withTransaction } from "../db/transaction.ts";
import { NotFoundError } from "../lib/errors.ts";
import * as carriersRepo from "../repositories/carriers.ts";
import {
  maskedTaxIdFromCiphertext,
  readFullTaxId,
  sealTaxId,
} from "./tax-id.ts";
import { parseInput, resolveVersionWrite } from "./_helpers.ts";
import { requireCrmAccess } from "./crm-access.ts";

function toPublic(row: CarrierRow): CarrierPublic {
  return carrierPublicSchema.parse({
    id: row.id,
    usDot: row.us_dot,
    mc: row.mc,
    legalName: row.legal_name,
    dba: row.dba,
    businessAddress: row.business_address,
    ownerOperatorDriver: row.owner_operator_driver,
    taxIdMasked: maskedTaxIdFromCiphertext(row.tax_id_ciphertext),
    businessTelephone: row.business_telephone,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt:
      row.archived_at === null ? null : row.archived_at.toISOString(),
  });
}

export async function listCarriers(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  await requireCrmAccess(actor);
  const query = parseInput(carriersListQuerySchema, input);
  const result = await carriersRepo.listCarriers({
    limit: query.limit,
    offset: query.offset,
    ...(query.q !== undefined ? { q: query.q } : {}),
    archived: query.archived,
    sort: query.sort,
    dir: query.dir,
  });
  return carriersListResponseSchema.parse({
    items: result.items.map(toPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getCarrier(
  actor: Actor,
  id: string,
): Promise<CarrierPublic> {
  await requireCrmAccess(actor);
  const row =
    actor.role === "admin"
      ? await carriersRepo.getCarrierById(id)
      : await carriersRepo.getActiveCarrierById(id);
  if (row === null) {
    throw new NotFoundError("Carrier not found");
  }
  return toPublic(row);
}

export async function createCarrier(
  actor: Actor,
  input: unknown,
): Promise<CarrierPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(carrierCreateSchema, input);
  const row = await carriersRepo.insertCarrier({
    usDot: body.usDot,
    mc: body.mc,
    legalName: body.legalName,
    dba: body.dba,
    businessAddress: body.businessAddress,
    ownerOperatorDriver: body.ownerOperatorDriver,
    taxIdCiphertext: sealTaxId(body.taxId),
    businessTelephone: body.businessTelephone,
  });
  return toPublic(row);
}

export async function updateCarrier(
  actor: Actor,
  input: unknown,
): Promise<CarrierPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(carrierUpdateSchema, input);
  const updated = await carriersRepo.updateCarrier({
    id: body.id,
    version: body.version,
    usDot: body.usDot,
    mc: body.mc,
    legalName: body.legalName,
    dba: body.dba,
    businessAddress: body.businessAddress,
    ownerOperatorDriver: body.ownerOperatorDriver,
    ...(body.taxId !== undefined
      ? { taxIdCiphertext: sealTaxId(body.taxId) }
      : {}),
    businessTelephone: body.businessTelephone,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => carriersRepo.getCarrierById(body.id),
    notFoundMessage: "Carrier not found",
    conflictMessage: "Carrier version conflict",
  });
  return toPublic(row);
}

export async function archiveCarrier(
  actor: Actor,
  input: unknown,
): Promise<CarrierPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(carrierArchiveSchema, input);
  const row = await withTransaction(async (tx) => {
    const archived = await carriersRepo.archiveCarrier(
      { id: body.id, version: body.version },
      tx,
    );
    const carrier = await resolveVersionWrite({
      result: archived,
      lookup: () => carriersRepo.getCarrierById(body.id, tx),
      notFoundMessage: "Carrier not found",
      conflictMessage: "Carrier version conflict",
    });
    await carriersRepo.archiveActiveSalesByCarrierId(body.id, tx);
    return carrier;
  });
  return toPublic(row);
}

export async function restoreCarrier(
  actor: Actor,
  input: unknown,
): Promise<CarrierPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(carrierRestoreSchema, input);
  const restored = await carriersRepo.restoreCarrier({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => carriersRepo.getCarrierById(body.id),
    notFoundMessage: "Carrier not found",
    conflictMessage: "Carrier version conflict",
  });
  return toPublic(row);
}

export async function revealCarrierTaxId(
  actor: Actor,
  carrierId: string,
  correlationId: string,
): Promise<unknown> {
  await requireCrmAccess(actor);
  const row = await carriersRepo.getActiveCarrierById(carrierId);
  if (row === null) {
    throw new NotFoundError("Carrier not found");
  }
  const taxId = await readFullTaxId({
    actor,
    ciphertext: row.tax_id_ciphertext,
    carrierId: row.id,
    carrierUsDot: row.us_dot,
    carrierMc: row.mc,
    carrierLegalName: row.legal_name,
    correlationId,
  });
  return taxIdRevealResponseSchema.parse({
    carrierId: row.id,
    taxId,
  });
}
