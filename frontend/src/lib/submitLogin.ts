import { demoCustomer } from "@/constants/demoCustomer";
import type { LoginFormValues } from "@/constants/login";

export type LoginSubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

const DEMO_PASSWORD = "northline";

export async function submitLogin(
  values: LoginFormValues,
): Promise<LoginSubmitResult> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 900);
  });

  const email = values.email.trim().toLowerCase();
  const password = values.password;

  if (
    email !== demoCustomer.email.toLowerCase() ||
    password !== DEMO_PASSWORD
  ) {
    return { ok: false, reason: "credentials" };
  }

  return { ok: true };
}
