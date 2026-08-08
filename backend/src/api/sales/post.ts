import {
  saleSheetCreateSchema,
  saleSheetPublicSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as salesService from "../../services/sales.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: saleSheetCreateSchema,
  output: saleSheetPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  return salesService.createSaleSheet(requireActor(input.ctx), input.body);
}
