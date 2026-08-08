import {
  messagesListQuerySchema,
  messagesListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as messagesService from "../../services/messages.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: messagesListQuerySchema,
  output: messagesListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return messagesService.listMessages(requireActor(input.ctx), input.query);
}
