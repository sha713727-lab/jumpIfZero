import {
  callbackRestoreSchema,
  callbackRowSchema,
  z,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../middleware/context.ts";
import * as callbacksService from "../../../../../services/callbacks.ts";
import { parseWithSchema, requireActor } from "../../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: callbackRestoreSchema.omit({ id: true }),
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
    callbackRestoreSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return callbacksService.restoreCallback(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
