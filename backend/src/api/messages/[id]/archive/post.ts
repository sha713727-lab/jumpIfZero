import { idParamSchema, messagePublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as messagesService from "../../../../services/messages.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  output: messagePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  return messagesService.archiveMessage(
    requireActor(input.ctx),
    input.params.id as string,
  );
}
