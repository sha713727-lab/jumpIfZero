import {
  employeeCreateSchema,
  employeePublicSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as employeesService from "../../services/employees.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: employeeCreateSchema,
  output: employeePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return employeesService.createEmployee(
    actor,
    input.body,
    input.ctx.correlationId,
  );
}
