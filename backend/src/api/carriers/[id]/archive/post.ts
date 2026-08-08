import {
  carrierArchiveSchema,
  carrierPublicSchema,
  idParamSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as carriersService from "../../../../services/carriers.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  body: carrierArchiveSchema.omit({ id: true }),
  output: carrierPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const body = input.body as Record<string, unknown>;
  return carriersService.archiveCarrier(requireActor(input.ctx), {
    ...body,
    id: input.params.id,
  });
}
