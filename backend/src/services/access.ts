import type { Actor } from "@jumpifzero/contracts";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.ts";
import { query } from "../db/query.ts";
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
  const result = await query<{ id: string }>(
    `
      SELECT id
      FROM clients_active
      WHERE user_id = $1
      LIMIT 1
    `,
    [actor.subjectId],
  );
  const row = result.rows[0];
  if (row === undefined) {
    throw new ForbiddenError();
  }
  return row.id;
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
    const result = await query(
      `
        SELECT 1
        FROM client_employee_assignments a
        INNER JOIN clients_active c ON c.id = a.client_id
        WHERE a.client_id = $1
          AND a.employee_id = $2
        LIMIT 1
      `,
      [clientId, employeeId],
    );
    if (result.rows.length === 0) {
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
    const result = await query<{ client_id: string }>(
      `
        SELECT a.client_id
        FROM client_employee_assignments a
        INNER JOIN clients_active c ON c.id = a.client_id
        WHERE a.employee_id = $1
      `,
      [employeeId],
    );
    return result.rows.map((row) => row.client_id);
  }
  throw new ForbiddenError();
}
