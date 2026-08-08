"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type {
  AdminInvoice,
  AdminMessage,
  AdminProject,
  AdminFile,
} from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminFile,
  archiveAdminInvoice,
  changeAdminProjectStatus,
  createAdminInvoice,
  createAdminMessage,
  createAdminProject,
  putClientAssignments,
  uploadAdminFile,
} from "@/lib/data/adminOperations";
import { requireSession, type SessionPayload } from "@/lib/session";

export type OpsActionResult<T = void> =
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

function mapBackendError(error: unknown): OpsActionResult<never> {
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

export async function putAssignmentsAction(input: {
  readonly clientId: string;
  readonly employeeIds: readonly string[];
}): Promise<OpsActionResult> {
  try {
    const session = await requireSession("admin");
    await putClientAssignments(
      actorFromSession(session),
      input.clientId,
      input.employeeIds,
    );
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function changeProjectStatusAction(input: {
  readonly id: string;
  readonly version: number;
  readonly statusCode: "requested" | "approved" | "in_progress" | "completed";
}): Promise<OpsActionResult<AdminProject>> {
  try {
    const session = await requireSession("admin");
    const data = await changeAdminProjectStatus(
      actorFromSession(session),
      input,
    );
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function createMessageAction(input: {
  readonly clientId: string;
  readonly body: string;
  readonly fileIds?: readonly string[];
}): Promise<OpsActionResult<AdminMessage>> {
  try {
    const session = await requireSession("admin");
    const data = await createAdminMessage(actorFromSession(session), input);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function createInvoiceAction(input: {
  readonly clientId: string | null;
  readonly number: string;
  readonly title: string;
  readonly amount: string;
  readonly currency?: string;
  readonly statusCode?: "draft" | "sent" | "paid";
  readonly dueDate?: string | null;
  readonly issuedOn?: string | null;
  readonly billToCompany: string;
  readonly billToName: string;
  readonly billToEmail: string;
  readonly billToPhone: string;
  readonly billToLocation: string;
  readonly fromCompany: string;
  readonly fromEmail: string;
  readonly fromPhone: string;
}): Promise<OpsActionResult<AdminInvoice>> {
  try {
    const session = await requireSession("admin");
    const data = await createAdminInvoice(actorFromSession(session), {
      clientId: input.clientId,
      number: input.number,
      title: input.title,
      amount: input.amount.replace(/[^\d.]/g, "") || "0",
      currency: input.currency ?? "USD",
      statusCode: input.statusCode ?? "draft",
      dueDate: input.dueDate ?? null,
      issuedOn: input.issuedOn ?? null,
      billToCompany: input.billToCompany,
      billToName: input.billToName,
      billToEmail: input.billToEmail,
      billToPhone: input.billToPhone,
      billToLocation: input.billToLocation,
      fromCompany: input.fromCompany,
      fromEmail: input.fromEmail,
      fromPhone: input.fromPhone,
      idempotencyKey: crypto.randomUUID(),
    });
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveInvoiceAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<OpsActionResult> {
  try {
    const session = await requireSession("admin");
    await archiveAdminInvoice(actorFromSession(session), input);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function createProjectAction(input: {
  readonly clientId: string;
  readonly serviceId: string;
  readonly title: string;
  readonly notes?: string;
}): Promise<OpsActionResult<AdminProject>> {
  try {
    const session = await requireSession("admin");
    const data = await createAdminProject(
      actorFromSession(session),
      input,
      new Map(),
    );
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveFileAction(input: {
  readonly id: string;
}): Promise<OpsActionResult> {
  try {
    const session = await requireSession("admin");
    await archiveAdminFile(actorFromSession(session), input.id);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function uploadFileAction(
  formData: FormData,
): Promise<OpsActionResult<AdminFile>> {
  try {
    const session = await requireSession("admin");
    const clientId = formData.get("clientId");
    const file = formData.get("file");
    const kindRaw = formData.get("kind");
    if (typeof clientId !== "string" || clientId.length === 0) {
      return { ok: false, reason: "validation" };
    }
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, reason: "validation" };
    }
    const kind =
      typeof kindRaw === "string" && kindRaw.trim().length > 0
        ? kindRaw.trim().slice(0, 64)
        : "professional";
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await uploadAdminFile(actorFromSession(session), {
      clientId,
      filename: file.name,
      mimeType: file.type.length > 0 ? file.type : "application/octet-stream",
      buffer,
      kind,
    });
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}
