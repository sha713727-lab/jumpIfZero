import {
  sitePrincipleCreateSchema,
  sitePrincipleRowSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as principlesService from "../../../services/site-principles.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  body: sitePrincipleCreateSchema,
  output: sitePrincipleRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return principlesService.createSitePrinciple(
    actor,
    input.body,
    input.ctx.correlationId,
  );
}
