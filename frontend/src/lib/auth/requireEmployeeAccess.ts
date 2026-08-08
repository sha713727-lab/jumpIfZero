import { cache } from "react";
import type { EmployeeKind } from "@/lib/data/admin";
import {
  clearSession,
  requireSession,
  type SessionPayload,
} from "@/lib/session";
import { redirect } from "next/navigation";

export type EmployeeSession = {
  readonly session: SessionPayload;
  readonly employeeId: string;
  readonly kind: EmployeeKind;
};

export const requireEmployeeSession = cache(
  async function requireEmployeeSession(): Promise<EmployeeSession> {
    const session = await requireSession("employee");

    if (session.employeeId === null || session.employeeKind === null) {
      await clearSession("employee");
      redirect("/employee/login");
    }

    return {
      session,
      employeeId: session.employeeId,
      kind: session.employeeKind,
    };
  },
);

export const requireEmployeeKind = cache(async function requireEmployeeKind(
  kind: EmployeeKind,
): Promise<EmployeeSession> {
  const access = await requireEmployeeSession();

  if (access.kind !== kind) {
    redirect("/employee");
  }

  return access;
});
