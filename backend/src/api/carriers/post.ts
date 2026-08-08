import { carrierCreateSchema, carrierPublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as carriersService from "../../services/carriers.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: carrierCreateSchema,
  output: carrierPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  return carriersService.createCarrier(requireActor(input.ctx), input.body);
}
