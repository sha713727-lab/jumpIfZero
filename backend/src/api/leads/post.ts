import { leadCreateSchema, leadPublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as leadsService from "../../services/leads.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: leadCreateSchema,
  output: leadPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  return leadsService.createLead(requireActor(input.ctx), input.body);
}
