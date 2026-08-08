"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type { AdminPortfolioItem } from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminPortfolio,
  createAdminPortfolio,
  updateAdminPortfolio,
} from "@/lib/data/adminPortfolio";
import { requireSession, type SessionPayload } from "@/lib/session";

export type AdminPortfolioActionResult =
  | { readonly ok: true; readonly item: AdminPortfolioItem }
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "unauthorized" | "conflict" | "validation" | "server" };

function actorFromSession(session: SessionPayload) {
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind: null,
  });
}

function mapBackendError(error: unknown): AdminPortfolioActionResult {
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

export async function createAdminPortfolioAction(input: {
  readonly title: string;
  readonly slug: string;
  readonly category: string;
  readonly summary: string;
  readonly image: string;
  readonly active: boolean;
}): Promise<AdminPortfolioActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const item = await createAdminPortfolio(actor, input);
    return { ok: true, item };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminPortfolioAction(input: {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly slug: string;
  readonly category: string;
  readonly summary: string;
  readonly image: string;
  readonly active: boolean;
  readonly publishedAt: string | null;
}): Promise<AdminPortfolioActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const item = await updateAdminPortfolio(actor, input);
    return { ok: true, item };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveAdminPortfolioAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminPortfolioActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    await archiveAdminPortfolio(actor, input);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
