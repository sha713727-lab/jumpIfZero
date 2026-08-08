"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type { AdminTeamMember } from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminTeamMember,
  createAdminTeamMember,
  reorderAdminTeamMembers,
  updateAdminTeamMember,
} from "@/lib/data/adminTeam";
import { requireSession, type SessionPayload } from "@/lib/session";

export type AdminTeamActionResult =
  | { readonly ok: true; readonly member: AdminTeamMember }
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "unauthorized" | "conflict" | "validation" | "server" };

function actorFromSession(session: SessionPayload) {
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind: null,
  });
}

function mapBackendError(error: unknown): AdminTeamActionResult {
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

export async function createAdminTeamMemberAction(input: {
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly image: string;
  readonly employeeId: string | null;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly socials: AdminTeamMember["socials"];
}): Promise<AdminTeamActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const member = await createAdminTeamMember(actor, input);
    return { ok: true, member };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminTeamMemberAction(input: {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly image: string;
  readonly employeeId: string | null;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly publishedAt: string | null;
  readonly socials: AdminTeamMember["socials"];
}): Promise<AdminTeamActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const member = await updateAdminTeamMember(actor, input);
    return { ok: true, member };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveAdminTeamMemberAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminTeamActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    await archiveAdminTeamMember(actor, input);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function reorderAdminTeamMemberAction(input: {
  readonly items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[];
}): Promise<AdminTeamActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    await reorderAdminTeamMembers(actor, input.items);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
