import { sitePrincipleRestoreSchema, sitePrincipleRowSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../middleware/context.ts";
import * as principlesService from "../../../../../services/site-principles.ts";
import { parseWithSchema, requireActor } from "../../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: sitePrincipleRestoreSchema.omit({ id: true }),
  output: sitePrincipleRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  const params = parseWithSchema(
    z.object({ id: z.uuid() }),
    input.params,
    "params",
  );
  const body = parseWithSchema(
    sitePrincipleRestoreSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return principlesService.restoreSitePrinciple(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
