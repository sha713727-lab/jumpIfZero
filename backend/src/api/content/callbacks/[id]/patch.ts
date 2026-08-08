import {
  callbackRowSchema,
  callbackUpdateSchema,
  z,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as callbacksService from "../../../../services/callbacks.ts";
import { parseWithSchema, requireActor } from "../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: callbackUpdateSchema.omit({ id: true }),
  output: callbackRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  const params = parseWithSchema(
    z.object({ id: z.uuid() }),
    input.params,
    "params",
  );
  const body = parseWithSchema(
    callbackUpdateSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return callbacksService.updateCallbackStatus(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
