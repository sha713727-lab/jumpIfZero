"use server";

import {
  demoAdmin,
  type AdminLoginFormValues,
} from "@/constants/adminAuth";
import { createSession } from "@/lib/session";

export type AdminLoginSubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export async function submitAdminLogin(
  values: AdminLoginFormValues,
): Promise<AdminLoginSubmitResult> {
  const expectedEmail = process.env.DEMO_ADMIN_EMAIL?.trim();
  const expectedPassword = process.env.DEMO_ADMIN_PASSWORD;

  if (!expectedEmail || expectedPassword === undefined || expectedPassword === "") {
    return { ok: false, reason: "server" };
  }

  const email = values.email.trim().toLowerCase();
  const password = values.password;

  if (
    email !== expectedEmail.toLowerCase() ||
    password !== expectedPassword
  ) {
    return { ok: false, reason: "credentials" };
  }

  await createSession("admin", demoAdmin.id);
  return { ok: true };
}
