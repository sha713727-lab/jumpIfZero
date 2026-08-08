import { siteTestimonialRowSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import { resolvePublishedOnly } from "../../../../services/_helpers.ts";
import * as testimonialsService from "../../../../services/site-testimonials.ts";
import { parseWithSchema, requireGatewayOrAdmin } from "../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  output: siteTestimonialRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  requireGatewayOrAdmin(input.ctx);
  const params = parseWithSchema(
    z.object({ id: z.uuid() }),
    input.params,
    "params",
  );
  return testimonialsService.getSiteTestimonialById(
    params.id,
    resolvePublishedOnly(input.ctx, false),
  );
}
