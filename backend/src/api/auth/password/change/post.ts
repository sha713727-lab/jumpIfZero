import {
  passwordChangeRequestSchema,
  passwordChangeResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as authService from "../../../../services/auth.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  body: passwordChangeRequestSchema,
  output: passwordChangeResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return authService.changePassword(actor, input.body);
}
