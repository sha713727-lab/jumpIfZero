import { idParamSchema, invoicePublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as invoicesService from "../../../services/invoices.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  output: invoicePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  return invoicesService.getInvoice(
    requireActor(input.ctx),
    input.params.id as string,
  );
}
