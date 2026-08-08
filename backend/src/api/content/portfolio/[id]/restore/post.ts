import {
  portfolioItemRestoreSchema,
  portfolioItemRowSchema,
  z,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../middleware/context.ts";
import * as portfolioService from "../../../../../services/portfolio-items.ts";
import { parseWithSchema, requireActor } from "../../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: portfolioItemRestoreSchema.omit({ id: true }),
  output: portfolioItemRowSchema,
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
    portfolioItemRestoreSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return portfolioService.restorePortfolioItem(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
