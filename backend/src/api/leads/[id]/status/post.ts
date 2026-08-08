import {
  idParamSchema,
  leadPublicSchema,
  leadStatusChangeSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as leadsService from "../../../../services/leads.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  body: leadStatusChangeSchema.omit({ id: true }),
  output: leadPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const body = input.body as Record<string, unknown>;
  return leadsService.changeLeadStatus(requireActor(input.ctx), {
    ...body,
    id: input.params.id,
  });
}
