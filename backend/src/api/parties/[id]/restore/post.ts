import {
  idParamSchema,
  partyPublicSchema,
  partyRestoreSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as partiesService from "../../../../services/parties.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  body: partyRestoreSchema.omit({ id: true }),
  output: partyPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const body = input.body as Record<string, unknown>;
  return partiesService.restoreParty(requireActor(input.ctx), {
    ...body,
    id: input.params.id,
  });
}
