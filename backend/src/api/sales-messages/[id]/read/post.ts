import { idParamSchema, salesMessagePublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as messagesService from "../../../../services/sales-messages.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  output: salesMessagePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  return messagesService.markSalesMessageRead(
    requireActor(input.ctx),
    input.params.id as string,
  );
}
