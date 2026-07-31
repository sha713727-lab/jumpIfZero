import { createHash, timingSafeEqual } from "node:crypto";
import { demoAdmin } from "@/constants/adminAuth";
import { initialAdminDemoState } from "@/lib/data/admin";
import { demoCustomer } from "@/lib/data/customer";
import { readDemoCredentials } from "@/schemas/env";
import type { SessionRole } from "@/lib/session";

export type CredentialLookupResult =
  | {
      readonly ok: true;
      readonly role: SessionRole;
      readonly subjectId: string;
    }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export type CredentialLookupInput = {
  readonly role: SessionRole;
  readonly email: string;
  readonly password: string;
};

function digestUtf8(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function secretsEqual(left: string, right: string): boolean {
  return timingSafeEqual(digestUtf8(left), digestUtf8(right));
}

async function verifyPassword(
  candidate: string,
  storedSecret: string,
): Promise<boolean> {
  return secretsEqual(candidate, storedSecret);
}

export async function lookupCredentials(
  input: CredentialLookupInput,
): Promise<CredentialLookupResult> {
  const credentials = readDemoCredentials();

  if (!credentials) {
    return { ok: false, reason: "server" };
  }

  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (input.role === "admin") {
    const expectedEmail = credentials.DEMO_ADMIN_EMAIL.toLowerCase();
    const expectedPassword = credentials.DEMO_ADMIN_PASSWORD;

    const emailOk = secretsEqual(email, expectedEmail);
    const passwordOk = await verifyPassword(password, expectedPassword);

    if (!emailOk || !passwordOk) {
      return { ok: false, reason: "credentials" };
    }

    return { ok: true, role: "admin", subjectId: demoAdmin.id };
  }

  if (input.role === "customer") {
    const expectedPassword = credentials.DEMO_CUSTOMER_PASSWORD;

    const emailOk = secretsEqual(email, demoCustomer.email.toLowerCase());
    const passwordOk = await verifyPassword(password, expectedPassword);

    if (!emailOk || !passwordOk) {
      return { ok: false, reason: "credentials" };
    }

    return { ok: true, role: "customer", subjectId: demoCustomer.id };
  }

  const expectedPassword = credentials.DEMO_EMPLOYEE_PASSWORD;

  const employee = initialAdminDemoState.employees.find(
    (item) => item.active && item.email.toLowerCase() === email,
  );

  const passwordOk = await verifyPassword(password, expectedPassword);

  if (!employee || !passwordOk) {
    return { ok: false, reason: "credentials" };
  }

  return { ok: true, role: "employee", subjectId: employee.id };
}
