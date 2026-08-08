"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type { AdminFaq } from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminFaq,
  createAdminFaq,
  reorderAdminFaqs,
  updateAdminFaq,
} from "@/lib/data/adminFaqs";
import { requireSession, type SessionPayload } from "@/lib/session";

export type AdminFaqActionResult =
  | { readonly ok: true; readonly faq: AdminFaq }
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "unauthorized" | "conflict" | "validation" | "server" };

function actorFromSession(session: SessionPayload) {
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind: null,
  });
}

function mapBackendError(error: unknown): AdminFaqActionResult {
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

export async function createAdminFaqAction(input: {
  readonly question: string;
  readonly answer: string;
  readonly sortOrder: number;
  readonly active: boolean;
}): Promise<AdminFaqActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const faq = await createAdminFaq(actor, input);
    return { ok: true, faq };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminFaqAction(input: {
  readonly id: string;
  readonly version: number;
  readonly question: string;
  readonly answer: string;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly publishedAt: string | null;
}): Promise<AdminFaqActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const faq = await updateAdminFaq(actor, input);
    return { ok: true, faq };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveAdminFaqAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminFaqActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    await archiveAdminFaq(actor, input);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function reorderAdminFaqAction(input: {
  readonly items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[];
}): Promise<AdminFaqActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    await reorderAdminFaqs(actor, input.items);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
