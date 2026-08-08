"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type { AdminService } from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminService,
  createAdminService,
  updateAdminService,
} from "@/lib/data/adminServices";
import { requireSession, type SessionPayload } from "@/lib/session";

export type AdminServiceActionResult =
  | { readonly ok: true; readonly service: AdminService }
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "unauthorized" | "conflict" | "validation" | "server" };

function actorFromSession(session: SessionPayload) {
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind: null,
  });
}

function mapBackendError(error: unknown): AdminServiceActionResult {
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

export async function createAdminServiceAction(input: {
  readonly title: string;
  readonly slug: string;
  readonly description: string;
  readonly path: string;
  readonly image: string;
  readonly active: boolean;
}): Promise<AdminServiceActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const service = await createAdminService(actor, input);
    return { ok: true, service };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminServiceAction(input: {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly slug: string;
  readonly description: string;
  readonly path: string;
  readonly image: string;
  readonly active: boolean;
  readonly publishedAt: string | null;
}): Promise<AdminServiceActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const service = await updateAdminService(actor, input);
    return { ok: true, service };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveAdminServiceAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminServiceActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    await archiveAdminService(actor, input);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
