import {
  leadFollowUpPublicSchema,
  leadFollowUpsListResponseSchema,
  leadPublicSchema,
  leadsListResponseSchema,
  salesListResponseSchema,
  salesMessagePublicSchema,
  salesMessagesListResponseSchema,
  saleSheetPublicSchema,
  taxIdRevealResponseSchema,
  type Actor,
  type LeadFollowUpPublic,
  type LeadPublic,
  type SaleSheetPublic,
  type SalesMessagePublic,
} from "@jumpifzero/contracts";
import { z } from "@jumpifzero/contracts/z";
import type {
  AdminLead,
  AdminLeadFollowUp,
  AdminSale,
  AdminSalesMessage,
  LeadStatus,
  SaleStatus,
} from "@jumpifzero/contracts/admin";
import type { CarrierSaleFields } from "@/constants/sales";
import { normalizeSaleAmount } from "@/constants/sales";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatFollowUpAt(value: string): string {
  const date = new Date(value);
  const day = formatUpdatedAt(value);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${day} · ${time}`;
}

function formatMessageAt(value: string): string {
  return formatFollowUpAt(value);
}

export function toAdminSale(row: SaleSheetPublic): AdminSale {
  return {
    id: row.id,
    carrierId: row.carrierId,
    repId: row.repId,
    status: row.statusCode,
    amount: row.amount,
    currency: row.currency,
    usDot: row.usDot,
    mc: row.mc,
    legalName: row.legalName,
    dba: row.dba,
    businessAddress: row.businessAddress,
    ownerOperatorDriver: row.ownerOperatorDriver,
    taxId: row.taxIdMasked,
    salesAgent: row.salesAgent,
    businessTelephone: row.businessTelephone,
    truckType: row.truckType,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    truck: row.truck,
    trailer: row.trailer,
    insuranceName: row.insuranceName,
    insurancePhone: row.insurancePhone,
    insuranceStreet: row.insuranceStreet,
    insuranceCityStateZip: row.insuranceCityStateZip,
    insuranceEmail: row.insuranceEmail,
    factoringName: row.factoringName,
    factoringPhone: row.factoringPhone,
    factoringStreet: row.factoringStreet,
    factoringCityStateZip: row.factoringCityStateZip,
    factoringEmail: row.factoringEmail,
    approvedBy: row.approvedBy,
    version: row.version,
    updatedAt: formatUpdatedAt(row.updatedAt),
  };
}

export function toAdminLead(row: LeadPublic): AdminLead {
  return {
    id: row.id,
    repId: row.repId,
    company: row.company,
    contactName: row.contactName,
    phone: row.phone,
    email: row.email,
    source: row.source,
    status: row.statusCode,
    notes: row.notes,
    version: row.version,
    updatedAt: formatUpdatedAt(row.updatedAt),
  };
}

export function toAdminLeadFollowUp(row: LeadFollowUpPublic): AdminLeadFollowUp {
  return {
    id: row.id,
    leadId: row.leadId,
    at: formatFollowUpAt(row.occurredAt),
    note: row.note,
    outcome: row.outcome,
  };
}

export function toAdminSalesMessage(row: SalesMessagePublic): AdminSalesMessage {
  return {
    id: row.id,
    fromRepId: row.fromRepId,
    toRepId: row.toRepId,
    body: row.body,
    at: formatMessageAt(row.sentAt),
    read: row.readAt !== null,
  };
}

export function buildSaleSheetWriteBody(
  fields: CarrierSaleFields,
  status: SaleStatus,
  options?: { readonly taxIdMasked?: string },
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    usDot: fields.usDot.trim(),
    mc: fields.mc.trim(),
    legalName: fields.legalName.trim(),
    dba: fields.dba.trim(),
    businessAddress: fields.businessAddress.trim(),
    ownerOperatorDriver: fields.ownerOperatorDriver.trim(),
    businessTelephone: fields.businessTelephone.trim(),
    truckType: fields.truckType.trim(),
    contactName: fields.contactName.trim(),
    contactPhone: fields.contactPhone.trim(),
    contactEmail: fields.contactEmail.trim(),
    truck: fields.truck.trim(),
    trailer: fields.trailer.trim(),
    insuranceName: fields.insuranceName.trim(),
    insurancePhone: fields.insurancePhone.trim(),
    insuranceStreet: fields.insuranceStreet.trim(),
    insuranceCityStateZip: fields.insuranceCityStateZip.trim(),
    insuranceEmail: fields.insuranceEmail.trim(),
    factoringName: fields.factoringName.trim(),
    factoringPhone: fields.factoringPhone.trim(),
    factoringStreet: fields.factoringStreet.trim(),
    factoringCityStateZip: fields.factoringCityStateZip.trim(),
    factoringEmail: fields.factoringEmail.trim(),
    amount: normalizeSaleAmount(fields.amount),
    currency: fields.currency.trim(),
    statusCode: status,
  };

  const taxId = fields.taxId.trim();
  if (options?.taxIdMasked !== undefined) {
    if (taxId.length > 0 && taxId !== options.taxIdMasked) {
      body.taxId = taxId;
    }
  } else {
    body.taxId = taxId;
  }

  return body;
}

export async function listAdminSales(actor: Actor): Promise<AdminSale[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/sales",
    query: { limit: "100" },
    actor,
    outputSchema: salesListResponseSchema,
  });
  return response.items.map(toAdminSale);
}

export async function listAdminLeads(actor: Actor): Promise<AdminLead[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/leads",
    query: { limit: "100" },
    actor,
    outputSchema: leadsListResponseSchema,
  });
  return response.items.map(toAdminLead);
}

export async function listAdminLeadFollowUpsForLeads(
  actor: Actor,
  leadIds: readonly string[],
): Promise<AdminLeadFollowUp[]> {
  const batches = await Promise.all(
    leadIds.map(async (leadId) => {
      const response = await backendRequest({
        method: "GET",
        path: "/lead-follow-ups",
        query: { limit: "100", leadId },
        actor,
        outputSchema: leadFollowUpsListResponseSchema,
      });
      return response.items.map(toAdminLeadFollowUp);
    }),
  );
  return batches.flat();
}

export async function listAdminSalesMessages(
  actor: Actor,
): Promise<AdminSalesMessage[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/sales-messages",
    query: { limit: "100" },
    actor,
    outputSchema: salesMessagesListResponseSchema,
  });
  return response.items.map(toAdminSalesMessage);
}

export async function createAdminSaleSheet(
  actor: Actor,
  input: Record<string, unknown>,
): Promise<AdminSale> {
  const row = await backendRequest({
    method: "POST",
    path: "/sales",
    body: input,
    actor,
    outputSchema: saleSheetPublicSchema,
  });
  return toAdminSale(row);
}

export async function updateAdminSaleSheet(
  actor: Actor,
  input: Record<string, unknown>,
): Promise<AdminSale> {
  const id = String(input.id);
  const body = { ...input };
  delete body.id;
  const row = await backendRequest({
    method: "PATCH",
    path: `/sales/${id}`,
    body,
    actor,
    outputSchema: saleSheetPublicSchema,
  });
  return toAdminSale(row);
}

export async function archiveAdminSale(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<AdminSale> {
  const row = await backendRequest({
    method: "POST",
    path: `/sales/${input.id}/archive`,
    body: { version: input.version },
    actor,
    outputSchema: saleSheetPublicSchema,
  });
  return toAdminSale(row);
}

export async function changeAdminSaleStatus(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly statusCode: SaleStatus;
  },
): Promise<AdminSale> {
  const row = await backendRequest({
    method: "POST",
    path: `/sales/${input.id}/status`,
    body: { version: input.version, statusCode: input.statusCode },
    actor,
    outputSchema: saleSheetPublicSchema,
  });
  return toAdminSale(row);
}

export async function createAdminLead(
  actor: Actor,
  input: Record<string, unknown>,
): Promise<AdminLead> {
  const row = await backendRequest({
    method: "POST",
    path: "/leads",
    body: input,
    actor,
    outputSchema: leadPublicSchema,
  });
  return toAdminLead(row);
}

export async function updateAdminLead(
  actor: Actor,
  input: Record<string, unknown>,
): Promise<AdminLead> {
  const id = String(input.id);
  const body = { ...input };
  delete body.id;
  const row = await backendRequest({
    method: "PATCH",
    path: `/leads/${id}`,
    body,
    actor,
    outputSchema: leadPublicSchema,
  });
  return toAdminLead(row);
}

export async function archiveAdminLead(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<AdminLead> {
  const row = await backendRequest({
    method: "POST",
    path: `/leads/${input.id}/archive`,
    body: { version: input.version },
    actor,
    outputSchema: leadPublicSchema,
  });
  return toAdminLead(row);
}

export async function changeAdminLeadStatus(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly statusCode: LeadStatus;
  },
): Promise<AdminLead> {
  const row = await backendRequest({
    method: "POST",
    path: `/leads/${input.id}/status`,
    body: { version: input.version, statusCode: input.statusCode },
    actor,
    outputSchema: leadPublicSchema,
  });
  return toAdminLead(row);
}

export async function createAdminLeadFollowUp(
  actor: Actor,
  input: {
    readonly leadId: string;
    readonly occurredAt: string;
    readonly note?: string;
    readonly outcome?: string;
  },
): Promise<AdminLeadFollowUp> {
  const row = await backendRequest({
    method: "POST",
    path: "/lead-follow-ups",
    body: {
      leadId: input.leadId,
      occurredAt: input.occurredAt,
      note: input.note ?? "",
      outcome: input.outcome ?? "",
    },
    actor,
    outputSchema: leadFollowUpPublicSchema,
  });
  return toAdminLeadFollowUp(row);
}

export async function updateAdminLeadFollowUp(
  actor: Actor,
  input: {
    readonly id: string;
    readonly occurredAt: string;
    readonly note: string;
    readonly outcome: string;
  },
): Promise<AdminLeadFollowUp> {
  const row = await backendRequest({
    method: "PATCH",
    path: `/lead-follow-ups/${input.id}`,
    body: {
      occurredAt: input.occurredAt,
      note: input.note,
      outcome: input.outcome,
    },
    actor,
    outputSchema: leadFollowUpPublicSchema,
  });
  return toAdminLeadFollowUp(row);
}

export async function deleteAdminLeadFollowUp(
  actor: Actor,
  id: string,
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/lead-follow-ups/${id}`,
    actor,
    outputSchema: z.null(),
  });
}

export async function createAdminSalesMessage(
  actor: Actor,
  input: { readonly toRepId: string; readonly body: string },
): Promise<AdminSalesMessage> {
  const row = await backendRequest({
    method: "POST",
    path: "/sales-messages",
    body: input,
    actor,
    outputSchema: salesMessagePublicSchema,
  });
  return toAdminSalesMessage(row);
}

export async function markAdminSalesMessageRead(
  actor: Actor,
  id: string,
): Promise<AdminSalesMessage> {
  const row = await backendRequest({
    method: "POST",
    path: `/sales-messages/${id}/read`,
    actor,
    outputSchema: salesMessagePublicSchema,
  });
  return toAdminSalesMessage(row);
}

export async function deleteAdminSalesMessage(
  actor: Actor,
  id: string,
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/sales-messages/${id}`,
    actor,
    outputSchema: z.null(),
  });
}

export async function revealAdminCarrierTaxId(
  actor: Actor,
  carrierId: string,
): Promise<string> {
  const row = await backendRequest({
    method: "GET",
    path: `/carriers/${carrierId}/tax-id`,
    actor,
    outputSchema: taxIdRevealResponseSchema,
  });
  return row.taxId;
}
