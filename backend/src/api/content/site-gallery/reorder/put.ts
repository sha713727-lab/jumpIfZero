import { siteGalleryImageReorderSchema, z } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as galleryService from "../../../../services/site-gallery-images.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  body: siteGalleryImageReorderSchema,
  output: z.null(),
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<null> {
  const actor = requireActor(input.ctx);
  await galleryService.reorderSiteGalleryImages(
    actor,
    input.body,
    input.ctx.correlationId,
  );
  return null;
}
