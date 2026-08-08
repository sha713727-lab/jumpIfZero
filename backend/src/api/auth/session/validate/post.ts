import {
  sessionTokenRequestSchema,
  sessionValidateResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as authService from "../../../../services/auth.ts";
import { requireGateway } from "../../../_helpers.ts";

export const schema = {
  body: sessionTokenRequestSchema,
  output: sessionValidateResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  requireGateway(input.ctx);
  return authService.validateSession(input.body);
}
