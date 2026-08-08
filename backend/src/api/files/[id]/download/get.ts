import { idParamSchema, z } from "@jumpifzero/contracts";
import { finished } from "node:stream/promises";
import type { RequestContext } from "../../../../middleware/context.ts";
import { applySecurityHeaders } from "../../../../lib/http.ts";
import { contentDispositionHeader } from "../../../../lib/upload-security.ts";
import * as filesService from "../../../../services/files.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  output: z.null(),
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<null> {
  const download = await filesService.openFileDownload(
    requireActor(input.ctx),
    input.params.id as string,
  );
  applySecurityHeaders(input.ctx.res);
  input.ctx.res.statusCode = 200;
  input.ctx.res.setHeader("Content-Type", download.contentType);
  input.ctx.res.setHeader("Content-Length", String(download.sizeBytes));
  input.ctx.res.setHeader(
    "Content-Disposition",
    contentDispositionHeader("attachment", download.originalName),
  );
  download.stream.pipe(input.ctx.res);
  await finished(input.ctx.res);
  return null;
}
