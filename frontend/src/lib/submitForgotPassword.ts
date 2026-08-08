"use server";

import {
  passwordForgotRequestSchema,
  passwordForgotResponseSchema,
} from "@jumpifzero/contracts/auth";
import { assertSameOrigin, SameOriginError } from "@/lib/assertSameOrigin";
import {
  GatewayRequestError,
  gatewayBackendRequest,
} from "@/lib/backend/gatewayClient";

export type ForgotPasswordResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "validation" | "server";
    };

export async function submitForgotPassword(input: {
  readonly email: string;
}): Promise<ForgotPasswordResult> {
  try {
    await assertSameOrigin();
  } catch (err) {
    if (err instanceof SameOriginError) {
      return { ok: false, reason: "server" };
    }
    throw err;
  }

  const parsed = passwordForgotRequestSchema.safeParse({
    email: input.email,
  });

  if (!parsed.success) {
    return { ok: false, reason: "validation" };
  }

  try {
    await gatewayBackendRequest({
      method: "POST",
      path: "/auth/password/forgot",
      body: parsed.data,
      outputSchema: passwordForgotResponseSchema,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      if (error.status === 400 || error.status === 422) {
        return { ok: false, reason: "validation" };
      }
    }
    return { ok: false, reason: "server" };
  }
}
