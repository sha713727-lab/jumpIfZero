import { callbackRowSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as callbacksService from "../../../../services/callbacks.ts";
import { parseWithSchema, requireActor } from "../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  output: callbackRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  const params = parseWithSchema(
    z.object({ id: z.uuid() }),
    input.params,
    "params",
  );
  return callbacksService.getCallbackById(actor, params.id);
}
