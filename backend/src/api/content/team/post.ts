import {
  teamMemberCreateSchema,
  teamMemberWithSocialsRowSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as teamService from "../../../services/team-members.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  body: teamMemberCreateSchema,
  output: teamMemberWithSocialsRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return teamService.createTeamMember(
    actor,
    input.body,
    input.ctx.correlationId,
  );
}
