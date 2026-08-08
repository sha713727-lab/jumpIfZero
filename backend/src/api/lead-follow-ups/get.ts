import {
  leadFollowUpsListQuerySchema,
  leadFollowUpsListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as followUpsService from "../../services/lead-follow-ups.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: leadFollowUpsListQuerySchema,
  output: leadFollowUpsListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return followUpsService.listLeadFollowUps(
    requireActor(input.ctx),
    input.query,
  );
}
