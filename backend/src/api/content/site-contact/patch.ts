import {
  siteContactPublicSchema,
  siteContactUpdateSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as siteContactService from "../../../services/site-contact.ts";
import { parseWithSchema, requireActor } from "../../_helpers.ts";

export const schema = {
  body: siteContactUpdateSchema,
  output: siteContactPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  const body = parseWithSchema(siteContactUpdateSchema, input.body, "body");
  return siteContactService.updateSiteContact(
    actor,
    body,
    input.ctx.correlationId,
  );
}
