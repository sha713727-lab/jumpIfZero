import type { Actor } from "@jumpifzero/contracts";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.ts";
import { findEmployeeAuthByUserId } from "../repositories/users.ts";

export async function requireCrmAccess(actor: Actor): Promise<void> {
  if (actor.role === "admin") {
    return;
  }
  if (actor.role === "employee" && actor.employeeKind === "sales") {
    return;
  }
  throw new ForbiddenError();
}

export async function getSalesEmployeeId(actor: Actor): Promise<string> {
  if (actor.role !== "employee" || actor.employeeKind !== "sales") {
    throw new ForbiddenError();
  }
  const employee = await findEmployeeAuthByUserId(actor.subjectId);
  if (employee === null) {
    throw new UnauthorizedError();
  }
  return employee.id;
}

export async function resolveRepScope(
  actor: Actor,
): Promise<"all" | string> {
  await requireCrmAccess(actor);
  if (actor.role === "admin") {
    return "all";
  }
  return getSalesEmployeeId(actor);
}

export function assertOwnsRep(
  scope: "all" | string,
  repId: string,
): void {
  if (scope === "all") {
    return;
  }
  if (scope !== repId) {
    throw new ForbiddenError();
  }
}
