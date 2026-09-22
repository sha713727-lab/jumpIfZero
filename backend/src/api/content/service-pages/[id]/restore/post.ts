import {
  servicePageDetailSchema,
  servicePageRestoreSchema,
  z,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../middleware/context.ts";
import * as servicePagesService from "../../../../../services/service-pages.ts";
import { parseWithSchema, requireActor } from "../../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: servicePageRestoreSchema.omit({ id: true }),
  output: servicePageDetailSchema,
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
    servicePageRestoreSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return servicePagesService.restoreServicePage(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
