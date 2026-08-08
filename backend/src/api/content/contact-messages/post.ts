import { contactMessageCreateSchema, contactMessageRowSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as contactMessagesService from "../../../services/contact-messages.ts";
import { requireGateway } from "../../_helpers.ts";

export const schema = {
  body: contactMessageCreateSchema,
  output: contactMessageRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  requireGateway(input.ctx);
  return contactMessagesService.createContactMessage(
    input.body,
    input.ctx.correlationId,
  );
}
