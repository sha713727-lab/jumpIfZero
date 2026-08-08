import {
  teamMemberUpdateSchema,
  teamMemberWithSocialsRowSchema,
  z,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as teamService from "../../../../services/team-members.ts";
import { parseWithSchema, requireActor } from "../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: teamMemberUpdateSchema.omit({ id: true }),
  output: teamMemberWithSocialsRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  const params = parseWithSchema(
    z.object({ id: z.uuid() }),
    input.params,
    "params",
  );
  const body = parseWithSchema(
    teamMemberUpdateSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return teamService.updateTeamMember(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
