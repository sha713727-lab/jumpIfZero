import {
  siteGalleryImageCreateSchema,
  siteGalleryImageRowSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as galleryService from "../../../services/site-gallery-images.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  body: siteGalleryImageCreateSchema,
  output: siteGalleryImageRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return galleryService.createSiteGalleryImage(
    actor,
    input.body,
    input.ctx.correlationId,
  );
}
