import {
  carriersListQuerySchema,
  carriersListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as carriersService from "../../services/carriers.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: carriersListQuerySchema,
  output: carriersListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return carriersService.listCarriers(requireActor(input.ctx), input.query);
}
