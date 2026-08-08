import {
  invoiceCreateSchema,
  invoicePublicSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import { BadRequestError } from "../../lib/errors.ts";
import * as invoicesService from "../../services/invoices.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: invoiceCreateSchema,
  output: invoicePublicSchema,
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
  const result = await invoicesService.createInvoice(actor, input.body, {
    idempotencyKey: key,
    method: "POST",
    path: "/invoices",
  });
  return result.body;
}
