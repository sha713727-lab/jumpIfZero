import { clientPublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as clientsService from "../../../services/clients.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  output: clientPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
}): Promise<unknown> {
  return clientsService.getOwnClient(requireActor(input.ctx));
}
