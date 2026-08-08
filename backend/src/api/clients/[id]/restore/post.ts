import {
  clientPublicSchema,
  clientRestoreSchema,
  idParamSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as clientsService from "../../../../services/clients.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  body: clientRestoreSchema.omit({ id: true }),
  output: clientPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const body = input.body as Record<string, unknown>;
  return clientsService.restoreClient(requireActor(input.ctx), {
    ...body,
    id: input.params.id,
  });
}
