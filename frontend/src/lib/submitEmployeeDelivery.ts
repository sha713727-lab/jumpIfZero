"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type {
  AdminFile,
  AdminMessage,
  AdminProject,
} from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminFile,
  changeAdminProjectStatus,
  createAdminMessage,
  markAdminMessageRead,
  updateAdminProjectNotes,
  updateUserSelf,
  changeUserPassword,
  uploadAdminFile,
} from "@/lib/data/adminOperations";
import { verifySession, type SessionPayload } from "@/lib/session";

export type DeliveryActionResult<T = void> =
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

async function resolveDeliverySession(): Promise<SessionPayload | null> {
  const employee = await verifySession("employee");
  if (employee?.employeeKind === "delivery") {
    return employee;
  }
  return null;
}

function mapBackendError(error: unknown): DeliveryActionResult<never> {
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

const serviceTitleById = new Map<string, string>();

export async function updateProjectNotesAction(input: {
  readonly id: string;
  readonly version: number;
  readonly notes: string;
}): Promise<DeliveryActionResult<AdminProject>> {
  try {
    const session = await resolveDeliverySession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await updateAdminProjectNotes(
      actorFromSession(session),
      input,
      serviceTitleById,
    );
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function changeDeliveryProjectStatusAction(input: {
  readonly id: string;
  readonly version: number;
  readonly statusCode: "requested" | "approved" | "in_progress" | "completed";
}): Promise<DeliveryActionResult<AdminProject>> {
  try {
    const session = await resolveDeliverySession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await changeAdminProjectStatus(
      actorFromSession(session),
      input,
    );
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function createDeliveryMessageAction(input: {
  readonly clientId: string;
  readonly body: string;
  readonly fileIds?: readonly string[];
}): Promise<DeliveryActionResult<AdminMessage>> {
  try {
    const session = await resolveDeliverySession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await createAdminMessage(actorFromSession(session), input);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function markDeliveryMessageReadAction(input: {
  readonly id: string;
}): Promise<DeliveryActionResult<AdminMessage>> {
  try {
    const session = await resolveDeliverySession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await markAdminMessageRead(actorFromSession(session), input.id);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function uploadDeliveryFileAction(
  formData: FormData,
): Promise<DeliveryActionResult<AdminFile>> {
  try {
    const session = await resolveDeliverySession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const clientId = formData.get("clientId");
    const file = formData.get("file");
    if (typeof clientId !== "string" || clientId.length === 0) {
      return { ok: false, reason: "validation" };
    }
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, reason: "validation" };
    }
    const kindRaw = formData.get("kind");
    const kind =
      typeof kindRaw === "string" && kindRaw.trim().length > 0
        ? kindRaw.trim().slice(0, 64)
        : "chat";
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

export async function archiveDeliveryFileAction(input: {
  readonly id: string;
}): Promise<DeliveryActionResult> {
  try {
    const session = await resolveDeliverySession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    await archiveAdminFile(actorFromSession(session), input.id);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateDeliveryUserSelfAction(input: {
  readonly version: number;
  readonly name: string;
  readonly title: string | null;
}): Promise<
  DeliveryActionResult<{ readonly name: string; readonly title: string | null }>
> {
  try {
    const session = await resolveDeliverySession();
    if (!session) {
      return { ok: false, reason: "unauthorized" };
    }
    const data = await updateUserSelf(actorFromSession(session), input);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function changeDeliveryPasswordAction(input: {
  readonly currentPassword: string;
  readonly newPassword: string;
}): Promise<DeliveryActionResult> {
  try {
    const session = await verifySession("employee");
    if (!session || session.employeeKind == null) {
      return { ok: false, reason: "unauthorized" };
    }
    if (input.newPassword.length < 8) {
      return { ok: false, reason: "validation" };
    }
    await changeUserPassword(actorFromSession(session), input);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
