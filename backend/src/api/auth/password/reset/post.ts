import {
  passwordResetRequestSchema,
  passwordResetResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as authService from "../../../../services/auth.ts";
import { requireGateway } from "../../../_helpers.ts";

export const schema = {
  body: passwordResetRequestSchema,
  output: passwordResetResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  requireGateway(input.ctx);
  return authService.resetPassword(input.body);
}
