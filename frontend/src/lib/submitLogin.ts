"use server";

import type { LoginFormValues } from "@/schemas/login";
import { loginFieldErrors, loginFormSchema } from "@/schemas/login";
import { assertSameOrigin, SameOriginError } from "@/lib/assertSameOrigin";
import { lookupCredentials } from "@/lib/auth/lookupCredentials";
import { createSessionFromLogin } from "@/lib/session";

export type LoginSubmitResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly fieldErrors: ReturnType<typeof loginFieldErrors>;
    }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export async function submitLogin(
  values: LoginFormValues,
): Promise<LoginSubmitResult> {
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
    role: "customer",
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!result.ok) {
    return result;
  }

  await createSessionFromLogin({
    sessionToken: result.sessionToken,
    subject: result.subject,
    expiresAt: result.expiresAt,
    maxAge: result.maxAge,
  });
  return { ok: true };
}
