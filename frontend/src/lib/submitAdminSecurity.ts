"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import { BackendRequestError } from "@/lib/backend/client";
import {
  changeUserPassword,
  getAdminMe,
  updateAdminAccount,
} from "@/lib/data/adminOperations";
import { requireSession } from "@/lib/session";

export type AdminSecurityResult =
  | {
      readonly ok: true;
      readonly profile: {
        readonly id: string;
        readonly version: number;
        readonly name: string;
        readonly email: string;
        readonly title: string | null;
        readonly role: string;
      };
    }
  | {
      readonly ok: true;
      readonly account: {
        readonly version: number;
        readonly name: string;
        readonly email: string;
        readonly title: string | null;
      };
    }
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "unauthorized" | "conflict" | "validation" | "server";
    };

function actorFromAdminSession(subjectId: string) {
  return actorSchema.parse({
    subjectId,
    role: "admin",
    employeeKind: null,
  });
}

function mapBackendError(error: unknown): AdminSecurityResult {
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

export async function getAdminMeAction(): Promise<AdminSecurityResult> {
  try {
    const session = await requireSession("admin");
    const profile = await getAdminMe(actorFromAdminSession(session.subjectId));
    return { ok: true, profile };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminAccountAction(input: {
  readonly userId: string;
  readonly version: number;
  readonly name: string;
  readonly email: string;
  readonly title: string;
}): Promise<AdminSecurityResult> {
  if (
    input.userId.length === 0 ||
    input.name.trim().length === 0 ||
    input.email.trim().length === 0
  ) {
    return { ok: false, reason: "validation" };
  }

  try {
    const session = await requireSession("admin");
    const account = await updateAdminAccount(
      actorFromAdminSession(session.subjectId),
      {
        userId: input.userId,
        version: input.version,
        name: input.name.trim(),
        email: input.email.trim(),
        title: input.title.trim().length > 0 ? input.title.trim() : null,
      },
    );
    return { ok: true, account };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function changeAdminPasswordAction(input: {
  readonly currentPassword: string;
  readonly newPassword: string;
}): Promise<AdminSecurityResult> {
  if (
    input.currentPassword.length === 0 ||
    input.newPassword.length < 8 ||
    input.newPassword.length > 200
  ) {
    return { ok: false, reason: "validation" };
  }

  try {
    const session = await requireSession("admin");
    await changeUserPassword(actorFromAdminSession(session.subjectId), {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    });
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
