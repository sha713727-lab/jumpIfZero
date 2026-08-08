"use server";

import { assertSameOrigin, SameOriginError } from "@/lib/assertSameOrigin";
import {
  submitCallbackRequest,
  submitContactMessage,
  type PublicSubmitResult,
} from "@/lib/data/publicContent";

export type PublicContactActionResult = PublicSubmitResult;

export async function submitContactMessageAction(input: {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly body: string;
}): Promise<PublicContactActionResult> {
  try {
    await assertSameOrigin();
  } catch (err) {
    if (err instanceof SameOriginError) {
      return { ok: false, reason: "server" };
    }
    throw err;
  }
  return submitContactMessage(input);
}

export async function submitCallbackRequestAction(input: {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly note: string;
}): Promise<PublicContactActionResult> {
  try {
    await assertSameOrigin();
  } catch (err) {
    if (err instanceof SameOriginError) {
      return { ok: false, reason: "server" };
    }
    throw err;
  }
  return submitCallbackRequest(input);
}
