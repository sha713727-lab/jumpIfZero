import { filePublicSchema } from "@jumpifzero/contracts";
import { env } from "../../config/env.ts";
import type { RequestContext } from "../../middleware/context.ts";
import * as filesService from "../../services/files.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  output: filePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
}): Promise<unknown> {
  return filesService.uploadFile(requireActor(input.ctx), {
    headers: input.ctx.req.headers,
    rawBody: input.ctx.rawBody,
    maxFileBytes: env.BODY_MAX_BYTES,
  });
}
