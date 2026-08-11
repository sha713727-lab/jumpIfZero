import {
  idParamSchema,
  salarySlipArchiveSchema,
  salarySlipPublicSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as salarySlipsService from "../../../../services/salary-slips.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  body: salarySlipArchiveSchema.omit({ id: true }),
  output: salarySlipPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const body = input.body as Record<string, unknown>;
  return salarySlipsService.archiveSalarySlip(requireActor(input.ctx), {
    ...body,
    id: input.params.id,
  });
}
