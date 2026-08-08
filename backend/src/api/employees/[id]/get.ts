import { employeePublicSchema, idParamSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as employeesService from "../../../services/employees.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  output: employeePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return employeesService.getEmployee(actor, input.params.id as string);
}
