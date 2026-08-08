import { serviceCreateSchema, serviceRowSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as servicesService from "../../../services/services.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  body: serviceCreateSchema,
  output: serviceRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return servicesService.createService(
    actor,
    input.body,
    input.ctx.correlationId,
  );
}
