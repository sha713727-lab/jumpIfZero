"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type {
  AdminLead,
  AdminLeadFollowUp,
  AdminSale,
  AdminSalesMessage,
  LeadStatus,
  SaleStatus,
} from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminLead,
  archiveAdminSale,
  buildSaleSheetWriteBody,
  changeAdminLeadStatus,
  changeAdminSaleStatus,
  createAdminLead,
  createAdminLeadFollowUp,
  createAdminSaleSheet,
  createAdminSalesMessage,
  deleteAdminLeadFollowUp,
  deleteAdminSalesMessage,
  markAdminSalesMessageRead,
  revealAdminCarrierTaxId,
  updateAdminLead,
  updateAdminSaleSheet,
  updateAdminLeadFollowUp,
} from "@/lib/data/adminCrm";
import type { CarrierSaleFields } from "@/constants/sales";
import { saleSheetValidationMessage } from "@/constants/sales";
import { verifySession, type SessionPayload } from "@/lib/session";

export type CrmActionResult<T = void> =
  | ({ readonly ok: true } & (T extends void ? object : { readonly data: T }))
  | {
      readonly ok: false;
      readonly reason: "unauthorized" | "conflict" | "validation" | "server";
    };

function actorFromSession(session: SessionPayload) {
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind: session.employeeKind ?? null,
  });
}

async function resolveCrmSession(): Promise<SessionPayload | null> {
  const admin = await verifySession("admin");
  if (admin) {
    return admin;
  }
  const employee = await verifySession("employee");
  if (employee?.employeeKind === "sales") {
    return employee;
  }
  return null;
}

function mapBackendError(error: unknown): CrmActionResult<never> {
  if (error instanceof BackendRequestError) {
    if (error.status === 401 || error.status === 403) {
      return { ok: false, reason: "unauthorized" };
    }
    if (error.status === 409) {
      return { ok: false, reason: "conflict" };
    }
    if (error.status === 400 || error.status === 422) {
      return { ok: false, reason: "validation" };
    }
  }
  return { ok: false, reason: "server" };
}

export async function createSaleSheetAction(input: {
  readonly repId?: string;
  readonly fields: CarrierSaleFields;
  readonly status: SaleStatus;
}): Promise<CrmActionResult<AdminSale>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    if (saleSheetValidationMessage(input.fields, true) !== null) {
      return { ok: false, reason: "validation" };
    }
    const body = buildSaleSheetWriteBody(input.fields, input.status);
    if (session.role === "admin" && input.repId) {
      body.repId = input.repId;
    }
    const data = await createAdminSaleSheet(actorFromSession(session), body);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateSaleSheetAction(input: {
  readonly id: string;
  readonly version: number;
  readonly fields: CarrierSaleFields;
  readonly status: SaleStatus;
  readonly taxIdMasked: string;
}): Promise<CrmActionResult<AdminSale>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    if (saleSheetValidationMessage(input.fields, false) !== null) {
      return { ok: false, reason: "validation" };
    }
    const body = buildSaleSheetWriteBody(input.fields, input.status, {
      taxIdMasked: input.taxIdMasked,
    });
    const data = await updateAdminSaleSheet(actorFromSession(session), {
      id: input.id,
      version: input.version,
      ...body,
    });
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveSaleAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<CrmActionResult<AdminSale>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await archiveAdminSale(actorFromSession(session), input);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function changeSaleStatusAction(input: {
  readonly id: string;
  readonly version: number;
  readonly statusCode: SaleStatus;
}): Promise<CrmActionResult<AdminSale>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await changeAdminSaleStatus(actorFromSession(session), input);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function createLeadAction(input: {
  readonly repId?: string;
  readonly company: string;
  readonly contactName: string;
  readonly phone: string;
  readonly email: string;
  readonly source: string;
  readonly statusCode: LeadStatus;
  readonly notes: string;
}): Promise<CrmActionResult<AdminLead>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const body: Record<string, unknown> = {
      company: input.company.trim(),
      contactName: input.contactName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      source: input.source.trim(),
      statusCode: input.statusCode,
      notes: input.notes.trim(),
    };
    if (session.role === "admin" && input.repId) {
      body.repId = input.repId;
    }
    const data = await createAdminLead(actorFromSession(session), body);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateLeadAction(input: {
  readonly id: string;
  readonly version: number;
  readonly company: string;
  readonly contactName: string;
  readonly phone: string;
  readonly email: string;
  readonly source: string;
  readonly notes: string;
}): Promise<CrmActionResult<AdminLead>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await updateAdminLead(actorFromSession(session), {
      id: input.id,
      version: input.version,
      company: input.company.trim(),
      contactName: input.contactName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      source: input.source.trim(),
      notes: input.notes.trim(),
    });
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveLeadAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<CrmActionResult<AdminLead>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await archiveAdminLead(actorFromSession(session), input);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function changeLeadStatusAction(input: {
  readonly id: string;
  readonly version: number;
  readonly statusCode: LeadStatus;
}): Promise<CrmActionResult<AdminLead>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await changeAdminLeadStatus(actorFromSession(session), input);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function createLeadFollowUpAction(input: {
  readonly leadId: string;
  readonly note: string;
  readonly outcome: string;
}): Promise<CrmActionResult<AdminLeadFollowUp>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await createAdminLeadFollowUp(actorFromSession(session), {
      leadId: input.leadId,
      occurredAt: new Date().toISOString(),
      note: input.note.trim(),
      outcome: input.outcome.trim(),
    });
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateLeadFollowUpAction(input: {
  readonly id: string;
  readonly occurredAt: string;
  readonly note: string;
  readonly outcome: string;
}): Promise<CrmActionResult<AdminLeadFollowUp>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await updateAdminLeadFollowUp(actorFromSession(session), input);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function deleteLeadFollowUpAction(input: {
  readonly id: string;
}): Promise<CrmActionResult> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    await deleteAdminLeadFollowUp(actorFromSession(session), input.id);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function createSalesMessageAction(input: {
  readonly toRepId: string;
  readonly body: string;
}): Promise<CrmActionResult<AdminSalesMessage>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await createAdminSalesMessage(actorFromSession(session), {
      toRepId: input.toRepId,
      body: input.body.trim(),
    });
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function markSalesMessageReadAction(input: {
  readonly id: string;
}): Promise<CrmActionResult<AdminSalesMessage>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await markAdminSalesMessageRead(
      actorFromSession(session),
      input.id,
    );
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function deleteSalesMessageAction(input: {
  readonly id: string;
}): Promise<CrmActionResult> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    await deleteAdminSalesMessage(actorFromSession(session), input.id);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function revealCarrierTaxIdAction(input: {
  readonly carrierId: string;
}): Promise<CrmActionResult<string>> {
  try {
    const session = await resolveCrmSession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await revealAdminCarrierTaxId(
      actorFromSession(session),
      input.carrierId,
    );
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}
