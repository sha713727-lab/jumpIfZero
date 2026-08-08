import { clientsListQuerySchema, clientsListResponseSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as clientsService from "../../services/clients.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: clientsListQuerySchema,
  output: clientsListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return clientsService.listClients(requireActor(input.ctx), input.query);
}
