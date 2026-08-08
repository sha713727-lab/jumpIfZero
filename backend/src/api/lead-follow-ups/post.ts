import {
  leadFollowUpCreateSchema,
  leadFollowUpPublicSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as followUpsService from "../../services/lead-follow-ups.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: leadFollowUpCreateSchema,
  output: leadFollowUpPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  return followUpsService.createLeadFollowUp(
    requireActor(input.ctx),
    input.body,
  );
}
