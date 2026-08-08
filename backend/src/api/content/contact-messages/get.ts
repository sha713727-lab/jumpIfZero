import {
  contactMessagesListQuerySchema,
  contactMessagesListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as contactMessagesService from "../../../services/contact-messages.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  query: contactMessagesListQuerySchema,
  output: contactMessagesListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return contactMessagesService.listContactMessages(actor, input.query);
}
