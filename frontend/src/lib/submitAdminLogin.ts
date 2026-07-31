import { demoAdmin, type AdminLoginFormValues } from "@/constants/adminAuth";
import { getDemoAdminCredentials } from "@/lib/env";

export type AdminLoginSubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export async function submitAdminLogin(
  values: AdminLoginFormValues,
): Promise<AdminLoginSubmitResult> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 900);
  });

  const email = values.email.trim().toLowerCase();
  const password = values.password;
  const credentials = getDemoAdminCredentials();

  if (
    email !== demoAdmin.email.toLowerCase() ||
    password !== credentials.password
  ) {
    return { ok: false, reason: "credentials" };
  }

  return { ok: true };
}
