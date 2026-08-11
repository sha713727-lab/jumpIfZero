import {
  salarySlipsListQuerySchema,
  salarySlipsListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as salarySlipsService from "../../services/salary-slips.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: salarySlipsListQuerySchema,
  output: salarySlipsListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return salarySlipsService.listSalarySlips(
    requireActor(input.ctx),
    input.query,
  );
}
