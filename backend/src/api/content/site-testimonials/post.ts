import {
  siteTestimonialCreateSchema,
  siteTestimonialRowSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as testimonialsService from "../../../services/site-testimonials.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  body: siteTestimonialCreateSchema,
  output: siteTestimonialRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return testimonialsService.createSiteTestimonial(
    actor,
    input.body,
    input.ctx.correlationId,
  );
}
