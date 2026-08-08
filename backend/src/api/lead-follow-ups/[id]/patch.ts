import {
  idParamSchema,
  leadFollowUpPublicSchema,
  leadFollowUpUpdateSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as followUpsService from "../../../services/lead-follow-ups.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  body: leadFollowUpUpdateSchema.omit({ id: true }),
  output: leadFollowUpPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const body = input.body as Record<string, unknown>;
  return followUpsService.updateLeadFollowUp(requireActor(input.ctx), {
    ...body,
    id: input.params.id,
  });
}
