import {
  employeePublicSchema,
  employeeSelfImageUpdateSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as employeesService from "../../../../services/employees.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  body: employeeSelfImageUpdateSchema,
  output: employeePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return employeesService.updateEmployeeSelfImage(
    actor,
    input.body,
    input.ctx.correlationId,
  );
}
