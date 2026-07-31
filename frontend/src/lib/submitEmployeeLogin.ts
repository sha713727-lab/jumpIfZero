"use server";

import type { EmployeeLoginFormValues } from "@/constants/employeeAuth";
import { lookupCredentials } from "@/lib/auth/lookupCredentials";
import { createSession } from "@/lib/session";

export type EmployeeLoginSubmitResult =
  | { readonly ok: true; readonly employeeId: string }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export async function submitEmployeeLogin(
  values: EmployeeLoginFormValues,
): Promise<EmployeeLoginSubmitResult> {
  const result = await lookupCredentials({
    role: "employee",
    email: values.email,
    password: values.password,
  });

  if (!result.ok) {
    return result;
  }

  await createSession(result.role, result.subjectId);
  return { ok: true, employeeId: result.subjectId };
}
