import { clientCreateSchema, clientPublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as clientsService from "../../services/clients.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: clientCreateSchema,
  output: clientPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  return clientsService.createClient(requireActor(input.ctx), input.body);
}
