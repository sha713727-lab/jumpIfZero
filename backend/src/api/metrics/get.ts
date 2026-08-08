import { z } from "@jumpifzero/contracts";
import { env } from "../../config/env.ts";
import { NotFoundError } from "../../lib/errors.ts";
import { applySecurityHeaders } from "../../lib/http.ts";
import { renderPrometheusMetrics } from "../../lib/metrics.ts";
import type { RequestContext } from "../../middleware/context.ts";

export const schema = {
  output: z.null(),
};

export default async function handle(input: {
  readonly ctx: RequestContext;
}): Promise<null> {
  if (!env.METRICS_ENABLED) {
    throw new NotFoundError();
  }
  applySecurityHeaders(input.ctx.res);
  input.ctx.res.statusCode = 200;
  input.ctx.res.setHeader(
    "Content-Type",
    "text/plain; version=0.0.4; charset=utf-8",
  );
  input.ctx.res.end(renderPrometheusMetrics());
  return null;
}
