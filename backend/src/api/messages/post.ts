import {
  messageCreateSchema,
  messagePublicSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as messagesService from "../../services/messages.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: messageCreateSchema,
  output: messagePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  return messagesService.createMessage(requireActor(input.ctx), input.body);
}
