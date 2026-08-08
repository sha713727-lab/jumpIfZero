import { siteContactPublicSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as siteContactService from "../../../services/site-contact.ts";
import { requireGatewayOrAdmin } from "../../_helpers.ts";

export const schema = {
  output: siteContactPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
}): Promise<unknown> {
  requireGatewayOrAdmin(input.ctx);
  return siteContactService.getSiteContact();
}
