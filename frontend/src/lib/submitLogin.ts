"use server";

import type { LoginFormValues } from "@/constants/login";
import { lookupCredentials } from "@/lib/auth/lookupCredentials";
import { createSession } from "@/lib/session";

export type LoginSubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export async function submitLogin(
  values: LoginFormValues,
): Promise<LoginSubmitResult> {
  const result = await lookupCredentials({
    role: "customer",
    email: values.email,
    password: values.password,
  });

  if (!result.ok) {
    return result;
  }

  await createSession(result.role, result.subjectId);
  return { ok: true };
}
