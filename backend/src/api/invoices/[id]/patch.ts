import {
  idParamSchema,
  invoicePublicSchema,
  invoiceUpdateSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as invoicesService from "../../../services/invoices.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  body: invoiceUpdateSchema.omit({ id: true }),
  output: invoicePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const body = input.body as Record<string, unknown>;
  return invoicesService.updateInvoice(requireActor(input.ctx), {
    ...body,
    id: input.params.id,
  });
}
