import {
  salarySlipCreateSchema,
  salarySlipPublicSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import { BadRequestError } from "../../lib/errors.ts";
import * as salarySlipsService from "../../services/salary-slips.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: salarySlipCreateSchema,
  output: salarySlipPublicSchema,
};

function readIdempotencyKey(
  headers: Record<string, string | string[] | undefined>,
): string | null {
  const raw = headers["idempotency-key"];
  if (raw === undefined) {
    return null;
  }
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  const key = readIdempotencyKey(input.ctx.req.headers);
  if (key === null || key.trim().length === 0) {
    throw new BadRequestError("Idempotency-Key required");
  }
  const result = await salarySlipsService.createSalarySlip(actor, input.body, {
    idempotencyKey: key,
    method: "POST",
    path: "/salary-slips",
  });
  return result.body;
}
