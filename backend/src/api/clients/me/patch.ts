import {
  clientPublicSchema,
  clientSelfUpdateSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as clientsService from "../../../services/clients.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  body: clientSelfUpdateSchema,
  output: clientPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  return clientsService.updateClientSelf(
    requireActor(input.ctx),
    input.body,
    input.ctx.correlationId,
  );
}
