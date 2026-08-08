"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type { AdminClient } from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import { updateAdminClientContact } from "@/lib/data/adminOperations";
import { requireSession } from "@/lib/session";

export type AdminClientActionResult =
  | { readonly ok: true; readonly data: AdminClient }
  | {
      readonly ok: false;
      readonly reason: "unauthorized" | "conflict" | "validation" | "server";
    };

function mapBackendError(error: unknown): AdminClientActionResult {
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

export async function updateAdminClientContactAction(input: {
  readonly clientId: string;
  readonly clientVersion: number;
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly phone: string;
  readonly location: string;
  readonly plan: string;
  readonly clientContactTitle: string;
  readonly statusCode: "active" | "paused";
  readonly memberSince: string;
}): Promise<AdminClientActionResult> {
  try {
    const session = await requireSession("admin");
    if (
      input.name.trim().length === 0 ||
      input.email.trim().length === 0 ||
      input.company.trim().length === 0
    ) {
      return { ok: false, reason: "validation" };
    }
    const actor = actorSchema.parse({
      subjectId: session.subjectId,
      role: "admin",
      employeeKind: null,
    });
    const data = await updateAdminClientContact(actor, input);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}
