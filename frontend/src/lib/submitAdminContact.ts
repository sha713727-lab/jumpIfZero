"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type { AdminContactMessage } from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminContactMessage,
  updateAdminContactMessage,
} from "@/lib/data/adminContact";
import { requireSession, type SessionPayload } from "@/lib/session";

export type AdminContactActionResult =
  | { readonly ok: true; readonly message: AdminContactMessage }
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "unauthorized" | "conflict" | "validation" | "server";
    };

function actorFromSession(session: SessionPayload) {
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind: null,
  });
}

function mapBackendError(error: unknown): AdminContactActionResult {
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

export async function markAdminContactMessageReadAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminContactActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const message = await updateAdminContactMessage(actor, {
      ...input,
      status: "read",
    });
    return { ok: true, message };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function deleteAdminContactMessageAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminContactActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    await archiveAdminContactMessage(actor, input);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
