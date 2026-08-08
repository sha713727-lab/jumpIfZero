import {
  salesListQuerySchema,
  salesListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as salesService from "../../services/sales.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: salesListQuerySchema,
  output: salesListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return salesService.listSales(requireActor(input.ctx), input.query);
}
