import { idParamSchema, partyPublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as partiesService from "../../../services/parties.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  output: partyPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  return partiesService.getParty(
    requireActor(input.ctx),
    input.params.id as string,
  );
}
