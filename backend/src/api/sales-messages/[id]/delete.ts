import { idParamSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as messagesService from "../../../services/sales-messages.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  output: z.null(),
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<null> {
  await messagesService.deleteSalesMessage(
    requireActor(input.ctx),
    input.params.id as string,
  );
  return null;
}
