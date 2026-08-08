import { idParamSchema, saleSheetPublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as salesService from "../../../services/sales.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  output: saleSheetPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  return salesService.getSale(
    requireActor(input.ctx),
    input.params.id as string,
  );
}
