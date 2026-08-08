import { siteTestimonialRowSchema, siteTestimonialUpdateSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as testimonialsService from "../../../../services/site-testimonials.ts";
import { parseWithSchema, requireActor } from "../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: siteTestimonialUpdateSchema.omit({ id: true }),
  output: siteTestimonialRowSchema,
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
    siteTestimonialUpdateSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return testimonialsService.updateSiteTestimonial(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
