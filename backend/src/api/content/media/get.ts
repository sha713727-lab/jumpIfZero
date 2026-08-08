import { cmsMediaKeyQuerySchema, z } from "@jumpifzero/contracts";
import { finished } from "node:stream/promises";
import type { RequestContext } from "../../../middleware/context.ts";
import { applySecurityHeaders } from "../../../lib/http.ts";
import { contentDispositionHeader } from "../../../lib/upload-security.ts";
import * as cmsMediaService from "../../../services/cms-media.ts";
import { parseWithSchema, requireGatewayOrAdmin } from "../../_helpers.ts";

export const schema = {
  query: cmsMediaKeyQuerySchema,
  output: z.null(),
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<null> {
  requireGatewayOrAdmin(input.ctx);
  const query = parseWithSchema(cmsMediaKeyQuerySchema, input.query, "query");
  const media = await cmsMediaService.openCmsMedia(query.key);
  applySecurityHeaders(input.ctx.res);
  input.ctx.res.statusCode = 200;
  input.ctx.res.setHeader("Content-Type", media.contentType);
  input.ctx.res.setHeader(
    "Content-Disposition",
    contentDispositionHeader(
      "inline",
      query.key.split("/").pop() ?? "media",
    ),
  );
  media.stream.pipe(input.ctx.res);
  await finished(input.ctx.res);
  return null;
}
