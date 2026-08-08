import { z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as contactMessagesService from "../../../../services/contact-messages.ts";
import { parseWithSchema, requireActor } from "../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: z.object({ version: z.number().int().min(1) }),
  output: z.null(),
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<null> {
  const actor = requireActor(input.ctx);
  const params = parseWithSchema(
    z.object({ id: z.uuid() }),
    input.params,
    "params",
  );
  const body = parseWithSchema(
    z.object({ version: z.number().int().min(1) }),
    input.body,
    "body",
  );
  await contactMessagesService.archiveContactMessage(
    actor,
    {
      id: params.id,
      version: body.version,
    },
    input.ctx.correlationId,
  );
  return null;
}
