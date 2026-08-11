"use server";

import {
  passwordResetRequestSchema,
  passwordResetResponseSchema,
} from "@jumpifzero/contracts/auth";
import { assertSameOrigin, SameOriginError } from "@/lib/assertSameOrigin";
import {
  GatewayRequestError,
  gatewayBackendRequest,
} from "@/lib/backend/gatewayClient";

export type ResetPasswordResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "validation" | "unauthorized" | "server";
    };

export async function submitResetPassword(input: {
  readonly resetToken: string;
  readonly newPassword: string;
}): Promise<ResetPasswordResult> {
  try {
    await assertSameOrigin();
  } catch (err) {
    if (err instanceof SameOriginError) {
      return { ok: false, reason: "server" };
    }
    throw err;
  }

  const parsed = passwordResetRequestSchema.safeParse({
    resetToken: input.resetToken,
    newPassword: input.newPassword,
  });

  if (!parsed.success) {
    return { ok: false, reason: "validation" };
  }

  try {
    await gatewayBackendRequest({
      method: "POST",
      path: "/auth/password/reset",
      body: parsed.data,
      outputSchema: passwordResetResponseSchema,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      if (error.status === 401 || error.status === 403) {
        return { ok: false, reason: "unauthorized" };
      }
      if (error.status === 400 || error.status === 422) {
        return { ok: false, reason: "validation" };
      }
    }
    return { ok: false, reason: "server" };
  }
}
