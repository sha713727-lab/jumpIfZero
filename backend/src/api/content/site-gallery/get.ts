import { siteGalleryListQuerySchema, siteGalleryListResponseSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import { resolvePublishedOnly } from "../../../services/_helpers.ts";
import * as galleryService from "../../../services/site-gallery-images.ts";
import { parseWithSchema, requireGatewayOrAdmin } from "../../_helpers.ts";

export const schema = {
  query: siteGalleryListQuerySchema,
  output: siteGalleryListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  requireGatewayOrAdmin(input.ctx);
  const query = parseWithSchema(siteGalleryListQuerySchema, input.query, "query");
  return galleryService.listSiteGalleryImages(
    input.query,
    resolvePublishedOnly(input.ctx, query.publishedOnly),
  );
}
