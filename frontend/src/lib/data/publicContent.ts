import {
  callbackCreateSchema,
  contactMessageCreateSchema,
} from "@jumpifzero/contracts/content";
import {
  callbackRowSchema,
  contactMessageRowSchema,
} from "@jumpifzero/contracts/db-content";
import { z } from "@jumpifzero/contracts/z";
import {
  gatewayBackendRequest,
  GatewayRequestError,
} from "@/lib/backend/gatewayClient";

export type PublicSubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "validation" | "server" };

function mapSubmitError(error: unknown): PublicSubmitResult {
  if (error instanceof z.ZodError) {
    return { ok: false, reason: "validation" };
  }
  if (error instanceof GatewayRequestError) {
    if (error.status === 400 || error.status === 422) {
      return { ok: false, reason: "validation" };
    }
  }
  return { ok: false, reason: "server" };
}

export async function submitContactMessage(input: {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly body: string;
}): Promise<PublicSubmitResult> {
  try {
    const body = contactMessageCreateSchema.parse(input);
    await gatewayBackendRequest({
      method: "POST",
      path: "/content/contact-messages",
      body,
      outputSchema: contactMessageRowSchema,
    });
    return { ok: true };
  } catch (error) {
    return mapSubmitError(error);
  }
}

export async function submitCallbackRequest(input: {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly note: string;
}): Promise<PublicSubmitResult> {
  try {
    const body = callbackCreateSchema.parse(input);
    await gatewayBackendRequest({
      method: "POST",
      path: "/content/callbacks",
      body,
      outputSchema: callbackRowSchema,
    });
    return { ok: true };
  } catch (error) {
    return mapSubmitError(error);
  }
}
