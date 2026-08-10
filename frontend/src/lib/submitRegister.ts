"use server";

import {
  customerRegisterRequestSchema,
  customerRegisterResponseSchema,
} from "@jumpifzero/contracts/auth";
import {
  registerFieldErrors,
  registerFormSchema,
  type RegisterFormValues,
} from "@jumpifzero/contracts/login";
import { assertSameOrigin, SameOriginError } from "@/lib/assertSameOrigin";
import {
  GatewayRequestError,
  gatewayBackendRequest,
} from "@/lib/backend/gatewayClient";

export type RegisterSubmitResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly fieldErrors: ReturnType<typeof registerFieldErrors>;
    }
  | {
      readonly ok: false;
      readonly reason: "conflict" | "validation" | "server";
    };

export async function submitRegister(
  values: RegisterFormValues,
): Promise<RegisterSubmitResult> {
  try {
    await assertSameOrigin();
  } catch (err) {
    if (err instanceof SameOriginError) {
      return { ok: false, reason: "server" };
    }
    throw err;
  }

  const parsed = registerFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: registerFieldErrors(parsed.error) };
  }

  const body = customerRegisterRequestSchema.safeParse({
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
    company: parsed.data.company,
  });
  if (!body.success) {
    return { ok: false, reason: "validation" };
  }

  try {
    await gatewayBackendRequest({
      method: "POST",
      path: "/auth/register",
      body: body.data,
      outputSchema: customerRegisterResponseSchema,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      if (error.status === 409) {
        return { ok: false, reason: "conflict" };
      }
      if (error.status === 400 || error.status === 422) {
        return { ok: false, reason: "validation" };
      }
    }
    return { ok: false, reason: "server" };
  }
}
