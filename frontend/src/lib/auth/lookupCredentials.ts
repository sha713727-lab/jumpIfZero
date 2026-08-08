import {
  loginResponseSchema,
  type AuthSubject,
} from "@jumpifzero/contracts/auth";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";
import type { SessionRole } from "@/lib/session";

export type CredentialLookupResult =
  | {
      readonly ok: true;
      readonly role: SessionRole;
      readonly subject: AuthSubject;
      readonly sessionToken: string;
      readonly expiresAt: string;
      readonly maxAge: number;
    }
  | { readonly ok: false; readonly reason: "credentials" | "server" };

export type CredentialLookupInput = {
  readonly role: SessionRole;
  readonly email: string;
  readonly password: string;
};

function toSessionRole(role: AuthSubject["role"]): SessionRole {
  if (role === "client") {
    return "customer";
  }
  return role;
}

export async function lookupCredentials(
  input: CredentialLookupInput,
): Promise<CredentialLookupResult> {
  try {
    const data = await gatewayBackendRequest({
      method: "POST",
      path: "/auth/login",
      body: {
        email: input.email.trim().toLowerCase(),
        password: input.password,
      },
      outputSchema: loginResponseSchema,
    });

    const sessionRole = toSessionRole(data.subject.role);
    if (sessionRole !== input.role) {
      return { ok: false, reason: "credentials" };
    }

    return {
      ok: true,
      role: sessionRole,
      subject: data.subject,
      sessionToken: data.sessionToken,
      expiresAt: data.expiresAt,
      maxAge: data.cookie.maxAge,
    };
  } catch (err) {
    if (
      err instanceof Error &&
      "status" in err &&
      (err as { status: number }).status === 401
    ) {
      return { ok: false, reason: "credentials" };
    }
    return { ok: false, reason: "server" };
  }
}
