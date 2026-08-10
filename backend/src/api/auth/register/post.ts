import {
  customerRegisterRequestSchema,
  customerRegisterResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as authService from "../../../services/auth.ts";
import { clientIp, requireGateway } from "../../_helpers.ts";

export const schema = {
  body: customerRegisterRequestSchema,
  output: customerRegisterResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  requireGateway(input.ctx);
  return authService.registerCustomer(
    input.body,
    clientIp(input.ctx),
    input.ctx.correlationId,
  );
}
