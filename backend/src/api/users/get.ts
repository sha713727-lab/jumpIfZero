import {
  usersListQuerySchema,
  usersListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as usersService from "../../services/users.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: usersListQuerySchema,
  output: usersListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return usersService.listUsers(actor, input.query);
}
