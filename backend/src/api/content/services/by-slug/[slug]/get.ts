import { serviceRowSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../middleware/context.ts";
import { resolvePublishedOnly } from "../../../../../services/_helpers.ts";
import * as servicesService from "../../../../../services/services.ts";
import { parseWithSchema, requireGatewayOrAdmin } from "../../../../_helpers.ts";

export const schema = {
  params: z.object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  }),
  output: serviceRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  requireGatewayOrAdmin(input.ctx);
  const params = parseWithSchema(schema.params, input.params, "params");
  return servicesService.getServiceBySlug(
    params.slug,
    resolvePublishedOnly(input.ctx, false),
  );
}
