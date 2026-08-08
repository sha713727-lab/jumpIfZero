import { listQuerySchema, sitePrinciplesListResponseSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import { resolvePublishedOnly } from "../../../services/_helpers.ts";
import * as principlesService from "../../../services/site-principles.ts";
import { parseWithSchema, requireGatewayOrAdmin } from "../../_helpers.ts";

export const schema = {
  query: listQuerySchema,
  output: sitePrinciplesListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  requireGatewayOrAdmin(input.ctx);
  const query = parseWithSchema(listQuerySchema, input.query, "query");
  return principlesService.listSitePrinciples(
    input.query,
    resolvePublishedOnly(input.ctx, query.publishedOnly),
  );
}
