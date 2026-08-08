import {
  callbacksListQuerySchema,
  callbacksListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as callbacksService from "../../../services/callbacks.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  query: callbacksListQuerySchema,
  output: callbacksListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return callbacksService.listCallbacks(actor, input.query);
}
