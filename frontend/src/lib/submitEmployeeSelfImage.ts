"use server";

import {
  employeePublicSchema,
  employeeSelfImageUpdateSchema,
} from "@jumpifzero/contracts";
import { actorSchema } from "@jumpifzero/contracts/content";
import { BackendRequestError, backendRequest } from "@/lib/backend/client";
import { requireEmployeeSession } from "@/lib/auth/requireEmployeeAccess";
import type { AdminEmployee } from "@/lib/data/admin";

export type EmployeeSelfImageResult =
  | { readonly ok: true; readonly employee: AdminEmployee }
  | {
      readonly ok: false;
      readonly reason: "unauthorized" | "conflict" | "validation" | "server";
    };

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export async function updateEmployeeSelfImageAction(input: {
  readonly version: number;
  readonly imagePath: string;
}): Promise<EmployeeSelfImageResult> {
  const parsed = employeeSelfImageUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: "validation" };
  }

  try {
    const access = await requireEmployeeSession();
    const actor = actorSchema.parse({
      subjectId: access.session.subjectId,
      role: "employee",
      employeeKind: access.kind,
    });
    const row = await backendRequest({
      method: "PATCH",
      path: "/employees/me/image",
      body: parsed.data,
      actor,
      outputSchema: employeePublicSchema,
    });
    return {
      ok: true,
      employee: {
        id: row.id,
        name: row.user?.name ?? access.session.name,
        email: row.user?.email ?? access.session.email,
        role: row.title,
        department: row.department,
        kind: row.kind,
        image: row.imagePath,
        version: row.version,
        active: row.archivedAt === null,
        teamMemberId: null,
        updatedAt: formatUpdatedAt(row.updatedAt),
      },
    };
  } catch (error) {
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
}
