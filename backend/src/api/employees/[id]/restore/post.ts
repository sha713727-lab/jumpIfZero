import {
  employeePublicSchema,
  employeeRestoreSchema,
  idParamSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as employeesService from "../../../../services/employees.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  body: employeeRestoreSchema.omit({ id: true }),
  output: employeePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  const body =
    typeof input.body === "object" && input.body !== null
      ? { ...input.body, id: input.params.id }
      : { id: input.params.id };
  return employeesService.restoreEmployee(
    actor,
    body,
    input.ctx.correlationId,
  );
}
