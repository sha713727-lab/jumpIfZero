import { faqCreateSchema, faqRowSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as faqsService from "../../../services/faqs.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  body: faqCreateSchema,
  output: faqRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return faqsService.createFaq(actor, input.body, input.ctx.correlationId);
}
