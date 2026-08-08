import { partyCreateSchema, partyPublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as partiesService from "../../services/parties.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: partyCreateSchema,
  output: partyPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  return partiesService.createParty(requireActor(input.ctx), input.body);
}
