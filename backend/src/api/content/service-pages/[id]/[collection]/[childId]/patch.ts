import {
  servicePageBenefitRowSchema,
  servicePageBuildItemRowSchema,
  servicePageFaqRowSchema,
  servicePageOfferingRowSchema,
  servicePageProcessStepRowSchema,
  servicePageTechnologyRowSchema,
  z,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../../../middleware/context.ts";
import {
  servicePageCollectionSchema,
} from "../../../../../../services/service-pages.ts";
import * as servicePagesService from "../../../../../../services/service-pages.ts";
import { parseWithSchema, requireActor } from "../../../../../_helpers.ts";

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
  output: childRowSchema,
};

function mergeBody(
  body: unknown,
  fields: {
    readonly id: string;
    readonly servicePageId: string;
  },
): unknown {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fields;
  }
  return { ...body, ...fields };
}

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  const params = parseWithSchema(paramsSchema, input.params, "params");
  return servicePagesService.updateChild(
    actor,
    params.collection,
    params.id,
    params.childId,
    mergeBody(input.body, {
      id: params.childId,
      servicePageId: params.id,
    }),
    input.ctx.correlationId,
  );
}
