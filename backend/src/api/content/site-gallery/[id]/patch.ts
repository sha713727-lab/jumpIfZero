import { siteGalleryImageRowSchema, siteGalleryImageUpdateSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as galleryService from "../../../../services/site-gallery-images.ts";
import { parseWithSchema, requireActor } from "../../../_helpers.ts";

export const schema = {
  params: z.object({ id: z.uuid() }),
  body: siteGalleryImageUpdateSchema.omit({ id: true }),
  output: siteGalleryImageRowSchema,
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
    siteGalleryImageUpdateSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return galleryService.updateSiteGalleryImage(
    actor,
    {
      ...body,
      id: params.id,
    },
    input.ctx.correlationId,
  );
}
