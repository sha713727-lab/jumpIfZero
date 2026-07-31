"use server";

import type { LoginFormValues } from "@/schemas/login";
import { loginFieldErrors, loginFormSchema } from "@/schemas/login";
import { lookupCredentials } from "@/lib/auth/lookupCredentials";
import { createSession } from "@/lib/session";

export type EmployeeLoginSubmitResult =
  | { readonly ok: true; readonly employeeId: string }
  | {
      readonly ok: false;
      readonly fieldErrors: ReturnType<typeof loginFieldErrors>;
    }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export async function submitEmployeeLogin(
  values: LoginFormValues,
): Promise<EmployeeLoginSubmitResult> {
  const parsed = loginFormSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, fieldErrors: loginFieldErrors(parsed.error) };
  }

  const result = await lookupCredentials({
    role: "employee",
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!result.ok) {
    return result;
  }

  await createSession(result.role, result.subjectId);
  return { ok: true, employeeId: result.subjectId };
}
