"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type { AdminEmployee } from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminEmployee,
  createAdminEmployee,
  setAdminEmployeePassword,
  updateAdminEmployee,
} from "@/lib/data/adminEmployees";
import { requireSession } from "@/lib/session";

export type AdminEmployeeActionResult =
  | { readonly ok: true; readonly employee: AdminEmployee }
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "unauthorized" | "conflict" | "validation" | "server";
    };

function mapBackendError(error: unknown): AdminEmployeeActionResult {
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

export async function createAdminEmployeeAction(input: {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: string;
  readonly department: string;
  readonly kind: "delivery" | "sales";
  readonly image: string;
  readonly active: boolean;
}): Promise<AdminEmployeeActionResult> {
  if (
    input.name.trim().length === 0 ||
    input.email.trim().length === 0 ||
    input.password.length < 8 ||
    input.password.length > 200
  ) {
    return { ok: false, reason: "validation" };
  }

  try {
    const session = await requireSession("admin");
    const actor = actorSchema.parse({
      subjectId: session.subjectId,
      role: "admin",
      employeeKind: null,
    });
    const employee = await createAdminEmployee(actor, input);
    return { ok: true, employee };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminEmployeeAction(input: {
  readonly employeeId: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly department: string;
  readonly kind: "delivery" | "sales";
  readonly image: string;
  readonly active: boolean;
}): Promise<AdminEmployeeActionResult> {
  if (
    input.employeeId.length === 0 ||
    input.name.trim().length === 0 ||
    input.email.trim().length === 0
  ) {
    return { ok: false, reason: "validation" };
  }

  try {
    const session = await requireSession("admin");
    const actor = actorSchema.parse({
      subjectId: session.subjectId,
      role: "admin",
      employeeKind: null,
    });
    const employee = await updateAdminEmployee(actor, input);
    return { ok: true, employee };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function setAdminEmployeePasswordAction(input: {
  readonly employeeId: string;
  readonly password: string;
}): Promise<AdminEmployeeActionResult> {
  if (
    input.employeeId.length === 0 ||
    input.password.length < 8 ||
    input.password.length > 200
  ) {
    return { ok: false, reason: "validation" };
  }

  try {
    const session = await requireSession("admin");
    const actor = actorSchema.parse({
      subjectId: session.subjectId,
      role: "admin",
      employeeKind: null,
    });
    await setAdminEmployeePassword(actor, {
      employeeId: input.employeeId,
      password: input.password,
    });
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveAdminEmployeeAction(input: {
  readonly employeeId: string;
}): Promise<AdminEmployeeActionResult> {
  if (input.employeeId.length === 0) {
    return { ok: false, reason: "validation" };
  }

  try {
    const session = await requireSession("admin");
    const actor = actorSchema.parse({
      subjectId: session.subjectId,
      role: "admin",
      employeeKind: null,
    });
    await archiveAdminEmployee(actor, input.employeeId);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
