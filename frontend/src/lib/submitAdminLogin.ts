"use server";

import type { AdminLoginFormValues } from "@/constants/adminAuth";
import { lookupCredentials } from "@/lib/auth/lookupCredentials";
import { createSession } from "@/lib/session";

export type AdminLoginSubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export async function submitAdminLogin(
  values: AdminLoginFormValues,
): Promise<AdminLoginSubmitResult> {
  const result = await lookupCredentials({
    role: "admin",
    email: values.email,
    password: values.password,
  });

  if (!result.ok) {
    return result;
  }

  await createSession(result.role, result.subjectId);
  return { ok: true };
}
