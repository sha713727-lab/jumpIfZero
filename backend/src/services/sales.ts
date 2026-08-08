import {
  saleArchiveSchema,
  saleRestoreSchema,
  saleSheetCreateSchema,
  saleSheetPublicSchema,
  saleSheetUpdateSchema,
  salesListQuerySchema,
  salesListResponseSchema,
  saleStatusChangeSchema,
  type Actor,
  type CarrierRow,
  type SaleSheetPublic,
} from "@jumpifzero/contracts";
import type { PoolClient } from "pg";
import { withTransaction } from "../db/transaction.ts";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../lib/errors.ts";
import * as carriersRepo from "../repositories/carriers.ts";
import * as employeesRepo from "../repositories/employees.ts";
import * as partiesRepo from "../repositories/parties.ts";
import * as salesRepo from "../repositories/sales.ts";
import type { SaleSheetRow } from "../repositories/sales.ts";
import * as usersRepo from "../repositories/users.ts";
import { parseInput, resolveVersionWrite } from "./_helpers.ts";
import {
  assertOwnsRep,
  getSalesEmployeeId,
  requireCrmAccess,
  resolveRepScope,
} from "./crm-access.ts";
import { maskedTaxIdFromCiphertext, sealTaxId } from "./tax-id.ts";

type SheetWriteBody = {
  readonly usDot: string;
  readonly mc: string;
  readonly legalName: string;
  readonly dba: string;
  readonly businessAddress: string;
  readonly ownerOperatorDriver: string;
  readonly taxId?: string | undefined;
  readonly businessTelephone: string;
  readonly truckType: string;
  readonly contactName: string;
  readonly contactPhone: string;
  readonly contactEmail: string;
  readonly truck: string;
  readonly trailer: string;
  readonly insuranceName: string;
  readonly insurancePhone: string;
  readonly insuranceStreet: string;
  readonly insuranceCityStateZip: string;
  readonly insuranceEmail: string;
  readonly factoringName: string;
  readonly factoringPhone: string;
  readonly factoringStreet: string;
  readonly factoringCityStateZip: string;
  readonly factoringEmail: string;
  readonly amount: string;
  readonly currency: string;
  readonly statusCode: "draft" | "quoted" | "won" | "lost";
  readonly approvedByUserId?: string | null | undefined;
};

function str(value: string | null | undefined): string {
  return value ?? "";
}

function toSaleSheetPublic(row: SaleSheetRow): SaleSheetPublic {
  return saleSheetPublicSchema.parse({
    id: row.id,
    carrierId: row.carrier_id,
    repId: row.rep_id,
    statusCode: row.status_code,
    amount: row.amount,
    currency: row.currency,
    truckType: row.truck_type,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    truck: row.truck,
    trailer: row.trailer,
    insurancePartyId: row.insurance_party_id,
    factoringPartyId: row.factoring_party_id,
    approvedByUserId: row.approved_by_user_id,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt:
      row.archived_at === null ? null : row.archived_at.toISOString(),
    usDot: row.us_dot,
    mc: row.mc,
    legalName: row.legal_name,
    dba: row.dba,
    businessAddress: row.business_address,
    ownerOperatorDriver: row.owner_operator_driver,
    taxIdMasked: maskedTaxIdFromCiphertext(row.tax_id_ciphertext),
    businessTelephone: row.business_telephone,
    salesAgent: str(row.rep_user_name),
    insuranceName: str(row.insurance_name),
    insurancePhone: str(row.insurance_phone),
    insuranceStreet: str(row.insurance_street),
    insuranceCityStateZip: str(row.insurance_city_state_zip),
    insuranceEmail: str(row.insurance_email),
    factoringName: str(row.factoring_name),
    factoringPhone: str(row.factoring_phone),
    factoringStreet: str(row.factoring_street),
    factoringCityStateZip: str(row.factoring_city_state_zip),
    factoringEmail: str(row.factoring_email),
    approvedBy: str(row.approver_user_name),
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

async function validateApprovedByUserId(
  approvedByUserId: string | null | undefined,
): Promise<string | null> {
  if (approvedByUserId === undefined || approvedByUserId === null) {
    return null;
  }
  const user = await usersRepo.findActiveUserById(approvedByUserId);
  if (user === null) {
    throw new BadRequestError("approvedByUserId not found");
  }
  return approvedByUserId;
}

async function upsertCarrierInTxn(
  tx: PoolClient,
  body: SheetWriteBody,
): Promise<CarrierRow> {
  const byDot = await carriersRepo.findActiveByUsDot(body.usDot, tx);
  const byMc = await carriersRepo.findActiveByMc(body.mc, tx);

  if (byDot !== null && byMc !== null && byDot.id !== byMc.id) {
    throw new ConflictError("us_dot and mc match different carriers");
  }

  const existing = byDot ?? byMc;

  if (existing !== null) {
    const updated = await carriersRepo.updateCarrier(
      {
        id: existing.id,
        version: existing.version,
        usDot: body.usDot,
        mc: body.mc,
        legalName: body.legalName,
        dba: body.dba,
        businessAddress: body.businessAddress,
        ownerOperatorDriver: body.ownerOperatorDriver,
        businessTelephone: body.businessTelephone,
        ...(body.taxId !== undefined
          ? { taxIdCiphertext: sealTaxId(body.taxId) }
          : {}),
      },
      tx,
    );
    if (updated === null) {
      throw new ConflictError("Carrier version conflict");
    }
    return updated;
  }

  if (body.taxId === undefined) {
    throw new BadRequestError("taxId is required for new carriers");
  }

  return carriersRepo.insertCarrier(
    {
      usDot: body.usDot,
      mc: body.mc,
      legalName: body.legalName,
      dba: body.dba,
      businessAddress: body.businessAddress,
      ownerOperatorDriver: body.ownerOperatorDriver,
      taxIdCiphertext: sealTaxId(body.taxId),
      businessTelephone: body.businessTelephone,
    },
    tx,
  );
}

async function resolvePartyInTxn(
  tx: PoolClient,
  kind: "insurance" | "factoring",
  input: {
    readonly name: string;
    readonly phone: string;
    readonly street: string;
    readonly cityStateZip: string;
    readonly email: string;
  },
  existingPartyId: string | null,
): Promise<string | null> {
  if (input.name.trim().length === 0) {
    return null;
  }

  if (existingPartyId !== null) {
    const party = await partiesRepo.getActivePartyById(existingPartyId, tx);
    if (party !== null && party.kind === kind) {
      const updated = await partiesRepo.updateParty(
        {
          id: existingPartyId,
          version: party.version,
          name: input.name,
          phone: input.phone,
          street: input.street,
          cityStateZip: input.cityStateZip,
          email: input.email,
        },
        tx,
      );
      if (updated === null) {
        throw new ConflictError("Party version conflict");
      }
      return updated.id;
    }
  }

  const created = await partiesRepo.insertParty(
    {
      kind,
      name: input.name,
      phone: input.phone,
      street: input.street,
      cityStateZip: input.cityStateZip,
      email: input.email,
    },
    tx,
  );
  return created.id;
}

async function writeSaleSheetInTxn(
  tx: PoolClient,
  body: SheetWriteBody,
  input: {
    readonly repId: string;
    readonly saleId?: string;
    readonly version?: number;
    readonly existingInsurancePartyId?: string | null;
    readonly existingFactoringPartyId?: string | null;
  },
): Promise<SaleSheetRow> {
  const carrier = await upsertCarrierInTxn(tx, body);
  const insurancePartyId = await resolvePartyInTxn(
    tx,
    "insurance",
    {
      name: body.insuranceName,
      phone: body.insurancePhone,
      street: body.insuranceStreet,
      cityStateZip: body.insuranceCityStateZip,
      email: body.insuranceEmail,
    },
    input.existingInsurancePartyId ?? null,
  );
  const factoringPartyId = await resolvePartyInTxn(
    tx,
    "factoring",
    {
      name: body.factoringName,
      phone: body.factoringPhone,
      street: body.factoringStreet,
      cityStateZip: body.factoringCityStateZip,
      email: body.factoringEmail,
    },
    input.existingFactoringPartyId ?? null,
  );
  const approvedByUserId = await validateApprovedByUserId(
    body.approvedByUserId,
  );

  if (input.saleId === undefined || input.version === undefined) {
    const sale = await salesRepo.insertSale(
      {
        carrierId: carrier.id,
        repId: input.repId,
        statusCode: body.statusCode,
        amount: body.amount,
        currency: body.currency,
        truckType: body.truckType,
        contactName: body.contactName,
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail,
        truck: body.truck,
        trailer: body.trailer,
        insurancePartyId,
        factoringPartyId,
        approvedByUserId,
      },
      tx,
    );
    const sheet = await salesRepo.getSaleSheetById(sale.id, tx);
    if (sheet === null) {
      throw new NotFoundError("Sale not found");
    }
    return sheet;
  }

  const updated = await salesRepo.updateSale(
    {
      id: input.saleId,
      version: input.version,
      carrierId: carrier.id,
      statusCode: body.statusCode,
      amount: body.amount,
      currency: body.currency,
      truckType: body.truckType,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      truck: body.truck,
      trailer: body.trailer,
      insurancePartyId,
      factoringPartyId,
      approvedByUserId,
    },
    tx,
  );
  if (updated === null) {
    const existing = await salesRepo.getSaleById(input.saleId, tx);
    if (existing === null) {
      throw new NotFoundError("Sale not found");
    }
    throw new ConflictError("Sale version conflict");
  }
  const sheet = await salesRepo.getSaleSheetById(input.saleId, tx);
  if (sheet === null) {
    throw new NotFoundError("Sale not found");
  }
  return sheet;
}

export async function listSales(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  await requireCrmAccess(actor);
  const query = parseInput(salesListQuerySchema, input);
  const scope = await resolveRepScope(actor);
  const repIds = scope === "all" ? "all" : [scope];
  const result = await salesRepo.listSaleSheets({
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
  return salesListResponseSchema.parse({
    items: result.items.map(toSaleSheetPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getSale(
  actor: Actor,
  id: string,
): Promise<SaleSheetPublic> {
  await requireCrmAccess(actor);
  const scope = await resolveRepScope(actor);
  const row =
    actor.role === "admin"
      ? await salesRepo.getSaleSheetById(id)
      : await salesRepo.getActiveSaleSheetById(id);
  if (row === null) {
    throw new NotFoundError("Sale not found");
  }
  assertOwnsRep(scope, row.rep_id);
  return toSaleSheetPublic(row);
}

export async function createSaleSheet(
  actor: Actor,
  input: unknown,
): Promise<SaleSheetPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(saleSheetCreateSchema, input);
  const repId = await resolveRepIdForCreate(actor, body.repId);
  const row = await withTransaction((tx) =>
    writeSaleSheetInTxn(tx, body, { repId }),
  );
  return toSaleSheetPublic(row);
}

export async function updateSaleSheet(
  actor: Actor,
  input: unknown,
): Promise<SaleSheetPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(saleSheetUpdateSchema, input);
  const scope = await resolveRepScope(actor);
  const existing = await salesRepo.getActiveSaleById(body.id);
  if (existing === null) {
    throw new NotFoundError("Sale not found");
  }
  assertOwnsRep(scope, existing.rep_id);
  const row = await withTransaction((tx) =>
    writeSaleSheetInTxn(tx, body, {
      repId: existing.rep_id,
      saleId: body.id,
      version: body.version,
      existingInsurancePartyId: existing.insurance_party_id,
      existingFactoringPartyId: existing.factoring_party_id,
    }),
  );
  return toSaleSheetPublic(row);
}

export async function changeSaleStatus(
  actor: Actor,
  input: unknown,
): Promise<SaleSheetPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(saleStatusChangeSchema, input);
  const scope = await resolveRepScope(actor);
  const existing = await salesRepo.getActiveSaleById(body.id);
  if (existing === null) {
    throw new NotFoundError("Sale not found");
  }
  assertOwnsRep(scope, existing.rep_id);
  const updated = await salesRepo.updateSaleStatus({
    id: body.id,
    version: body.version,
    statusCode: body.statusCode,
  });
  await resolveVersionWrite({
    result: updated,
    lookup: () => salesRepo.getSaleById(body.id),
    notFoundMessage: "Sale not found",
    conflictMessage: "Sale version conflict",
  });
  const row = await salesRepo.getSaleSheetById(body.id);
  if (row === null) {
    throw new NotFoundError("Sale not found");
  }
  return toSaleSheetPublic(row);
}

export async function archiveSale(
  actor: Actor,
  input: unknown,
): Promise<SaleSheetPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(saleArchiveSchema, input);
  const scope = await resolveRepScope(actor);
  const existing = await salesRepo.getActiveSaleById(body.id);
  if (existing === null) {
    throw new NotFoundError("Sale not found");
  }
  assertOwnsRep(scope, existing.rep_id);
  const archived = await salesRepo.archiveSale({
    id: body.id,
    version: body.version,
  });
  await resolveVersionWrite({
    result: archived,
    lookup: () => salesRepo.getSaleById(body.id),
    notFoundMessage: "Sale not found",
    conflictMessage: "Sale version conflict",
  });
  const row = await salesRepo.getSaleSheetById(body.id);
  if (row === null) {
    throw new NotFoundError("Sale not found");
  }
  return toSaleSheetPublic(row);
}

export async function restoreSale(
  actor: Actor,
  input: unknown,
): Promise<SaleSheetPublic> {
  await requireCrmAccess(actor);
  const body = parseInput(saleRestoreSchema, input);
  const scope = await resolveRepScope(actor);
  const existing = await salesRepo.getSaleById(body.id);
  if (existing === null) {
    throw new NotFoundError("Sale not found");
  }
  assertOwnsRep(scope, existing.rep_id);
  const restored = await salesRepo.restoreSale({
    id: body.id,
    version: body.version,
  });
  await resolveVersionWrite({
    result: restored,
    lookup: () => salesRepo.getSaleById(body.id),
    notFoundMessage: "Sale not found",
    conflictMessage: "Sale version conflict",
  });
  const row = await salesRepo.getSaleSheetById(body.id);
  if (row === null) {
    throw new NotFoundError("Sale not found");
  }
  return toSaleSheetPublic(row);
}
