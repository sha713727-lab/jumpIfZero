"use server";

import type { LoginFormValues } from "@/schemas/login";
import { loginFieldErrors, loginFormSchema } from "@/schemas/login";
import { assertSameOrigin, SameOriginError } from "@/lib/assertSameOrigin";
import { lookupCredentials } from "@/lib/auth/lookupCredentials";
import { createSessionFromLogin } from "@/lib/session";

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
  try {
    await assertSameOrigin();
  } catch (err) {
    if (err instanceof SameOriginError) {
      return { ok: false, reason: "server" };
    }
    throw err;
  }

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

  const session = await createSessionFromLogin({
    sessionToken: result.sessionToken,
    subject: result.subject,
    expiresAt: result.expiresAt,
    maxAge: result.maxAge,
  });

  if (session.employeeId === null) {
    return { ok: false, reason: "server" };
  }

  return { ok: true, employeeId: session.employeeId };
}
