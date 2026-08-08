import {
  salesMessagesListQuerySchema,
  salesMessagesListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as messagesService from "../../services/sales-messages.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: salesMessagesListQuerySchema,
  output: salesMessagesListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return messagesService.listSalesMessages(
    requireActor(input.ctx),
    input.query,
  );
}
