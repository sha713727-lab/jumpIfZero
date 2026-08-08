import { sitePrincipleReorderSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as principlesService from "../../../../services/site-principles.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  body: sitePrincipleReorderSchema,
  output: z.null(),
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<null> {
  const actor = requireActor(input.ctx);
  await principlesService.reorderSitePrinciples(
    actor,
    input.body,
    input.ctx.correlationId,
  );
  return null;
}
