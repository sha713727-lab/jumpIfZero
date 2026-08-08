import {
  contactMessageRestoreSchema,
  contactMessageRowSchema,
  z,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../middleware/context.ts";
import * as contactMessagesService from "../../../../../services/contact-messages.ts";
import { parseWithSchema, requireActor } from "../../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: contactMessageRestoreSchema.omit({ id: true }),
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
    contactMessageRestoreSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return contactMessagesService.restoreContactMessage(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
