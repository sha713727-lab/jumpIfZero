import {
  invoicesListQuerySchema,
  invoicesListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as invoicesService from "../../services/invoices.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: invoicesListQuerySchema,
  output: invoicesListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return invoicesService.listInvoices(requireActor(input.ctx), input.query);
}
