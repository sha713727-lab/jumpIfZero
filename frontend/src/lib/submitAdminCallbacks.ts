"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type { AdminCallback } from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminCallback,
  updateAdminCallback,
} from "@/lib/data/adminCallbacks";
import { requireSession, type SessionPayload } from "@/lib/session";

export type AdminCallbackActionResult =
  | { readonly ok: true; readonly callback: AdminCallback }
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

function mapBackendError(error: unknown): AdminCallbackActionResult {
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

export async function resolveAdminCallbackAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminCallbackActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const callback = await updateAdminCallback(actor, {
      ...input,
      status: "resolved",
    });
    return { ok: true, callback };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function deleteAdminCallbackAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminCallbackActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    await archiveAdminCallback(actor, input);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
