import {
  idParamSchema,
  saleArchiveSchema,
  saleSheetPublicSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as salesService from "../../../../services/sales.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  body: saleArchiveSchema.omit({ id: true }),
  output: saleSheetPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const body = input.body as Record<string, unknown>;
  return salesService.archiveSale(requireActor(input.ctx), {
    ...body,
    id: input.params.id,
  });
}
