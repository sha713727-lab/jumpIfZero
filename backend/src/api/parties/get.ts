import {
  partiesListQuerySchema,
  partiesListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as partiesService from "../../services/parties.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: partiesListQuerySchema,
  output: partiesListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return partiesService.listParties(requireActor(input.ctx), input.query);
}
