import { z } from "@jumpifzero/contracts";
import {
  BadRequestError,
  ForbiddenError,
  ValidationError,
} from "../lib/errors.ts";
import type { RequestContext } from "../middleware/context.ts";

export function parseJsonBody(ctx: RequestContext): unknown {
  if (ctx.bodyText.trim().length === 0) {
    return null;
  }
  try {
    return JSON.parse(ctx.bodyText) as unknown;
  } catch {
    throw new BadRequestError("Malformed JSON body");
  }
}

export function parseWithSchema<T>(
  schema: z.ZodType<T>,
  input: unknown,
  label: string,
): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => ({
        path: issue.path.length > 0 ? issue.path.join(".") : label,
        message: issue.message,
      })),
    );
  }
  return parsed.data;
}

export function requireActor(ctx: RequestContext) {
  if (ctx.actor === null) {
    throw new ForbiddenError();
  }
  return ctx.actor;
}

export function requireGateway(ctx: RequestContext): void {
  if (!ctx.isGateway) {
    throw new ForbiddenError();
  }
}

export function requireGatewayOrAdmin(ctx: RequestContext): void {
  if (ctx.isGateway) {
    return;
  }
  if (ctx.actor !== null && ctx.actor.role === "admin") {
    return;
  }
  throw new ForbiddenError();
}

export function clientIp(ctx: RequestContext): string {
  return ctx.req.socket.remoteAddress ?? "unknown";
}
