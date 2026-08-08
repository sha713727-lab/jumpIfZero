import { z, type Actor } from "@jumpifzero/contracts";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../lib/errors.ts";
import type { RequestContext } from "../middleware/context.ts";

export function requireAdmin(actor: Actor): void {
  if (actor.role !== "admin") {
    throw new ForbiddenError();
  }
}

export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => ({
        path: issue.path.length > 0 ? issue.path.join(".") : "(root)",
        message: issue.message,
      })),
    );
  }
  return parsed.data;
}

export function toDateOrNull(value: string | null): Date | null {
  if (value === null) {
    return null;
  }
  return new Date(value);
}

export function resolvePublishedOnly(
  ctx: Pick<RequestContext, "isGateway" | "actor">,
  queryPublishedOnly: boolean,
): boolean {
  if (ctx.isGateway) {
    return true;
  }
  if (ctx.actor === null || ctx.actor.role !== "admin") {
    return true;
  }
  return queryPublishedOnly;
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

export async function resolveVersionWrite<T>(input: {
  readonly result: T | null;
  readonly lookup: () => Promise<unknown | null>;
  readonly notFoundMessage: string;
  readonly conflictMessage: string;
}): Promise<T> {
  if (input.result !== null) {
    return input.result;
  }

  const existing = await input.lookup();
  if (existing === null) {
    throw new NotFoundError(input.notFoundMessage);
  }

  throw new ConflictError(input.conflictMessage);
}
