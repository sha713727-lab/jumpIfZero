import type { Actor } from "@jumpifzero/contracts";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.ts";
import {
  hasActiveAssignment,
  listActiveClientIdsByEmployeeId,
} from "../repositories/client-assignments.ts";
import { findActiveClientIdByUserId } from "../repositories/clients.ts";
import { findEmployeeAuthByUserId } from "../repositories/users.ts";

export async function requireDeliveryOrAdmin(actor: Actor): Promise<void> {
  if (actor.role === "admin") {
    return;
  }
  if (actor.role === "employee" && actor.employeeKind === "delivery") {
    return;
  }
  throw new ForbiddenError();
}

export async function getDeliveryEmployeeId(actor: Actor): Promise<string> {
  if (actor.role !== "employee" || actor.employeeKind !== "delivery") {
    throw new ForbiddenError();
  }
  const employee = await findEmployeeAuthByUserId(actor.subjectId);
  if (employee === null) {
    throw new UnauthorizedError();
  }
  return employee.id;
}

export async function getOwnClientId(actor: Actor): Promise<string> {
  if (actor.role !== "client") {
    throw new ForbiddenError();
  }
  const clientId = await findActiveClientIdByUserId(actor.subjectId);
  if (clientId === null) {
    throw new ForbiddenError();
  }
  return clientId;
}

export async function assertCanAccessClient(
  actor: Actor,
  clientId: string,
): Promise<void> {
  if (actor.role === "admin") {
    return;
  }
  if (actor.role === "client") {
    const ownId = await getOwnClientId(actor);
    if (ownId !== clientId) {
      throw new ForbiddenError();
    }
    return;
  }
  if (actor.role === "employee" && actor.employeeKind === "delivery") {
    const employeeId = await getDeliveryEmployeeId(actor);
    const allowed = await hasActiveAssignment({ clientId, employeeId });
    if (!allowed) {
      throw new ForbiddenError();
    }
    return;
  }
  throw new ForbiddenError();
}

export async function accessibleClientIds(
  actor: Actor,
): Promise<"all" | readonly string[]> {
  if (actor.role === "admin") {
    return "all";
  }
  if (actor.role === "client") {
    return [await getOwnClientId(actor)];
  }
  if (actor.role === "employee" && actor.employeeKind === "delivery") {
    const employeeId = await getDeliveryEmployeeId(actor);
    return listActiveClientIdsByEmployeeId(employeeId);
  }
  throw new ForbiddenError();
}
