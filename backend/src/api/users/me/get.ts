import { userPublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as usersService from "../../../services/users.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  output: userPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return usersService.getUser(actor, actor.subjectId);
}
