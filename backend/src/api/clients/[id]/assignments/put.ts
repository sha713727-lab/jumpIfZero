import {
  assignmentsListResponseSchema,
  clientAssignmentsPutSchema,
  idParamSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as clientsService from "../../../../services/clients.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  body: clientAssignmentsPutSchema,
  output: assignmentsListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  return clientsService.putAssignments(
    requireActor(input.ctx),
    input.params.id as string,
    input.body,
  );
}
