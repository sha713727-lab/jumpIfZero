import { z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../../middleware/context.ts";
import {
  servicePageCollectionSchema,
} from "../../../../../../services/service-pages.ts";
import * as servicePagesService from "../../../../../../services/service-pages.ts";
import { parseWithSchema, requireActor } from "../../../../../_helpers.ts";

const paramsSchema = z.object({
  id: z.uuid(),
  collection: servicePageCollectionSchema,
  childId: z.uuid(),
});

export const schema = {
  params: paramsSchema,
  body: z.object({ version: z.number().int().min(1) }),
  output: z.null(),
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<null> {
  const actor = requireActor(input.ctx);
  const params = parseWithSchema(paramsSchema, input.params, "params");
  const body = parseWithSchema(
    z.object({ version: z.number().int().min(1) }),
    input.body,
    "body",
  );
  await servicePagesService.archiveChild(
    actor,
    params.collection,
    params.id,
    {
      id: params.childId,
      version: body.version,
    },
    input.ctx.correlationId,
  );
  return null;
}
