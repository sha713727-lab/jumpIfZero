import {
  portfolioItemCreateSchema,
  portfolioItemRowSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as portfolioService from "../../../services/portfolio-items.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  body: portfolioItemCreateSchema,
  output: portfolioItemRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return portfolioService.createPortfolioItem(
    actor,
    input.body,
    input.ctx.correlationId,
  );
}
