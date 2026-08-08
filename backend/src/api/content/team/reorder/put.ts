import { teamMemberReorderSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as teamService from "../../../../services/team-members.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  body: teamMemberReorderSchema,
  output: z.null(),
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<null> {
  const actor = requireActor(input.ctx);
  await teamService.reorderTeamMembers(
    actor,
    input.body,
    input.ctx.correlationId,
  );
  return null;
}
