import { cmsMediaUploadResponseSchema } from "@jumpifzero/contracts";
import { env } from "../../../config/env.ts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as cmsMediaService from "../../../services/cms-media.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  output: cmsMediaUploadResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return cmsMediaService.uploadCmsMedia(actor, {
    headers: input.ctx.req.headers,
    rawBody: input.ctx.rawBody,
    maxFileBytes: env.BODY_MAX_BYTES,
  }, input.ctx.correlationId);
}
