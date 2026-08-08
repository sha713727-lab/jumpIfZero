import { serviceRestoreSchema, serviceRowSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../middleware/context.ts";
import * as servicesService from "../../../../../services/services.ts";
import { parseWithSchema, requireActor } from "../../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: serviceRestoreSchema.omit({ id: true }),
  output: serviceRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  const params = parseWithSchema(
    z.object({ id: z.uuid() }),
    input.params,
    "params",
  );
  const body = parseWithSchema(
    serviceRestoreSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return servicesService.restoreService(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
