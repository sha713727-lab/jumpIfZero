import { faqRestoreSchema, faqRowSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../middleware/context.ts";
import * as faqsService from "../../../../../services/faqs.ts";
import { parseWithSchema, requireActor } from "../../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: faqRestoreSchema.omit({ id: true }),
  output: faqRowSchema,
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
    faqRestoreSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return faqsService.restoreFaq(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
