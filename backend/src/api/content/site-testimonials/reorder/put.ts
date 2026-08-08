import { siteTestimonialReorderSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as testimonialsService from "../../../../services/site-testimonials.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  body: siteTestimonialReorderSchema,
  output: z.null(),
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<null> {
  const actor = requireActor(input.ctx);
  await testimonialsService.reorderSiteTestimonials(
    actor,
    input.body,
    input.ctx.correlationId,
  );
  return null;
}
