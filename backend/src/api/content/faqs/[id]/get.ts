import { faqRowSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import { resolvePublishedOnly } from "../../../../services/_helpers.ts";
import * as faqsService from "../../../../services/faqs.ts";
import { parseWithSchema, requireGatewayOrAdmin } from "../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  output: faqRowSchema,
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
  return faqsService.getFaqById(
    params.id,
    resolvePublishedOnly(input.ctx, false),
  );
}
