import {
  initialAdminDemoState,
  type EmployeeKind,
} from "@/constants/adminDemo";
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

export async function requireEmployeeSession(): Promise<EmployeeSession> {
  const session = await requireSession("employee");
  const employee = initialAdminDemoState.employees.find(
    (item) => item.id === session.subjectId && item.active,
  );

  if (!employee) {
    await clearSession();
    redirect("/employee/login");
  }

  return {
    session,
    employeeId: employee.id,
    kind: employee.kind,
  };
}

export async function requireEmployeeKind(
  kind: EmployeeKind,
): Promise<EmployeeSession> {
  const access = await requireEmployeeSession();

  if (access.kind !== kind) {
    redirect("/employee");
  }

  return access;
}
