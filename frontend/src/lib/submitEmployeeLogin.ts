import type { EmployeeLoginFormValues } from "@/constants/employeeAuth";
import { initialAdminDemoState } from "@/constants/adminDemo";
import { getDemoEmployeePassword } from "@/lib/env";

export type EmployeeLoginSubmitResult =
  | { readonly ok: true; readonly employeeId: string }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export async function submitEmployeeLogin(
  values: EmployeeLoginFormValues,
): Promise<EmployeeLoginSubmitResult> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 900);
  });

  const email = values.email.trim().toLowerCase();
  const password = values.password;
  const expectedPassword = getDemoEmployeePassword();

  const employee = initialAdminDemoState.employees.find(
    (item) => item.active && item.email.toLowerCase() === email,
  );

  if (!employee || password !== expectedPassword) {
    return { ok: false, reason: "credentials" };
  }

  return { ok: true, employeeId: employee.id };
}
