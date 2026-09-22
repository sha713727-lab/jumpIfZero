import {
  servicePageBenefitRowSchema,
  servicePageBuildItemRowSchema,
  servicePageChildRestoreSchema,
  servicePageFaqRowSchema,
  servicePageOfferingRowSchema,
  servicePageProcessStepRowSchema,
  servicePageTechnologyRowSchema,
  z,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../../../middleware/context.ts";
import {
  servicePageCollectionSchema,
} from "../../../../../../../services/service-pages.ts";
import * as servicePagesService from "../../../../../../../services/service-pages.ts";
import { parseWithSchema, requireActor } from "../../../../../../_helpers.ts";

const paramsSchema = z.object({
  id: z.uuid(),
  collection: servicePageCollectionSchema,
  childId: z.uuid(),
});

const childRowSchema = z.union([
  servicePageOfferingRowSchema,
  servicePageBuildItemRowSchema,
  servicePageProcessStepRowSchema,
  servicePageTechnologyRowSchema,
  servicePageBenefitRowSchema,
  servicePageFaqRowSchema,
]);

export const schema = {
  params: paramsSchema,
  body: servicePageChildRestoreSchema.omit({ id: true }),
  output: childRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  const params = parseWithSchema(paramsSchema, input.params, "params");
  const body = parseWithSchema(
    servicePageChildRestoreSchema.omit({ id: true }),
    input.body,
    "body",
  );
  return servicePagesService.restoreChild(
    actor,
    params.collection,
    params.id,
    {
      ...body,
      id: params.childId,
    },
    input.ctx.correlationId,
  );
}
