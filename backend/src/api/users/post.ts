import { userCreateSchema, userPublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as usersService from "../../services/users.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: userCreateSchema,
  output: userPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return usersService.createUser(
    actor,
    input.body,
    input.ctx.correlationId,
  );
}
