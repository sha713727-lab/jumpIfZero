import {
  leadsListQuerySchema,
  leadsListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as leadsService from "../../services/leads.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: leadsListQuerySchema,
  output: leadsListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return leadsService.listLeads(requireActor(input.ctx), input.query);
}
