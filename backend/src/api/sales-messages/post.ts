import {
  salesMessageCreateSchema,
  salesMessagePublicSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as messagesService from "../../services/sales-messages.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: salesMessageCreateSchema,
  output: salesMessagePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  return messagesService.createSalesMessage(
    requireActor(input.ctx),
    input.body,
  );
}
