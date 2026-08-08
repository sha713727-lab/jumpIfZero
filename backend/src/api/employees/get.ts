import {
  employeesListQuerySchema,
  employeesListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as employeesService from "../../services/employees.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: employeesListQuerySchema,
  output: employeesListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return employeesService.listEmployees(actor, input.query);
}
