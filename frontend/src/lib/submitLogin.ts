"use server";

import { demoCustomer } from "@/constants/demoCustomer";
import type { LoginFormValues } from "@/constants/login";
import { createSession } from "@/lib/session";

export type LoginSubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export async function submitLogin(
  values: LoginFormValues,
): Promise<LoginSubmitResult> {
  const expectedPassword = process.env.DEMO_CUSTOMER_PASSWORD;

  if (expectedPassword === undefined || expectedPassword === "") {
    return { ok: false, reason: "server" };
  }

  const email = values.email.trim().toLowerCase();
  const password = values.password;

  if (
    email !== demoCustomer.email.toLowerCase() ||
    password !== expectedPassword
  ) {
    return { ok: false, reason: "credentials" };
  }

  await createSession("customer", demoCustomer.id);
  return { ok: true };
}
