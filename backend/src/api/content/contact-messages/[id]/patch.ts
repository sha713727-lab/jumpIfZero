import {
  contactMessageRowSchema,
  contactMessageUpdateSchema,
  z,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as contactMessagesService from "../../../../services/contact-messages.ts";
import { parseWithSchema, requireActor } from "../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: contactMessageUpdateSchema.omit({ id: true }),
  output: contactMessageRowSchema,
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
    contactMessageUpdateSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return contactMessagesService.updateContactMessageStatus(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
