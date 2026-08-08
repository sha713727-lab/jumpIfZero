import { siteTestimonialRestoreSchema, siteTestimonialRowSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../middleware/context.ts";
import * as testimonialsService from "../../../../../services/site-testimonials.ts";
import { parseWithSchema, requireActor } from "../../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: siteTestimonialRestoreSchema.omit({ id: true }),
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
    siteTestimonialRestoreSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return testimonialsService.restoreSiteTestimonial(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
