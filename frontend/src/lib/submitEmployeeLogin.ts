"use server";

import type { EmployeeLoginFormValues } from "@/constants/employeeAuth";
import { initialAdminDemoState } from "@/constants/adminDemo";
import { createSession } from "@/lib/session";

export type EmployeeLoginSubmitResult =
  | { readonly ok: true; readonly employeeId: string }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export async function submitEmployeeLogin(
  values: EmployeeLoginFormValues,
): Promise<EmployeeLoginSubmitResult> {
  const expectedPassword = process.env.DEMO_EMPLOYEE_PASSWORD;

  if (expectedPassword === undefined || expectedPassword === "") {
    return { ok: false, reason: "server" };
  }

  const email = values.email.trim().toLowerCase();
  const password = values.password;

  const employee = initialAdminDemoState.employees.find(
    (item) => item.active && item.email.toLowerCase() === email,
  );

  if (!employee || password !== expectedPassword) {
    return { ok: false, reason: "credentials" };
  }

  await createSession("employee", employee.id);
  return { ok: true, employeeId: employee.id };
}
