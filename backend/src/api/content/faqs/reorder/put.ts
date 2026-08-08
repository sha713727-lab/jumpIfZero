import { faqReorderSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as faqsService from "../../../../services/faqs.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  body: faqReorderSchema,
  output: z.null(),
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<null> {
  const actor = requireActor(input.ctx);
  await faqsService.reorderFaqs(
    actor,
    input.body,
    input.ctx.correlationId,
  );
  return null;
}
