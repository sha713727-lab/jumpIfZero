import { servicePageDetailSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../../middleware/context.ts";
import { resolvePublishedOnly } from "../../../../../../services/_helpers.ts";
import * as servicePagesService from "../../../../../../services/service-pages.ts";
import { parseWithSchema, requireGatewayOrAdmin } from "../../../../../_helpers.ts";

const slugParamSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const schema = {
  params: z.object({
    pillar: slugParamSchema,
    child: slugParamSchema,
  }),
  output: servicePageDetailSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  requireGatewayOrAdmin(input.ctx);
  const params = parseWithSchema(schema.params, input.params, "params");
  return servicePagesService.getServicePageByPath(
    params.pillar,
    params.child,
    resolvePublishedOnly(input.ctx, false),
  );
}
