import { correlationIdSchema } from "@jumpifzero/contracts";
import { newCorrelationId } from "../lib/crypto.ts";
import type { Middleware } from "./context.ts";

export const assignCorrelationId: Middleware = async (ctx) => {
  const inbound = ctx.req.headers["x-correlation-id"];
  const candidate = Array.isArray(inbound) ? inbound[0] : inbound;
  const parsed = correlationIdSchema.safeParse(candidate);
  ctx.correlationId = parsed.success ? parsed.data : newCorrelationId();
};
