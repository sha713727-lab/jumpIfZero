import {
  assignmentsListResponseSchema,
  idParamSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as clientsService from "../../../../services/clients.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  output: assignmentsListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  return clientsService.listAssignments(
    requireActor(input.ctx),
    input.params.id as string,
  );
}
