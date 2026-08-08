import { idParamSchema, taxIdRevealResponseSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as carriersService from "../../../../services/carriers.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  output: taxIdRevealResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  return carriersService.revealCarrierTaxId(
    requireActor(input.ctx),
    input.params.id as string,
    input.ctx.correlationId,
  );
}
