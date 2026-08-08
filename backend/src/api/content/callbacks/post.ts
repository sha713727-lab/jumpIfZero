import { callbackCreateSchema, callbackRowSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as callbacksService from "../../../services/callbacks.ts";
import { requireGateway } from "../../_helpers.ts";

export const schema = {
  body: callbackCreateSchema,
  output: callbackRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  requireGateway(input.ctx);
  return callbacksService.createCallback(
    input.body,
    input.ctx.correlationId,
  );
}
