import type { Actor, AuthSubject, UserAuthRow } from "@jumpifzero/contracts";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.ts";
import {
  findActiveUserById,
  findEmployeeAuthByUserId,
} from "../repositories/users.ts";

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

const SESSION_COOKIE_BY_ROLE = {
  admin: "__Host-jz_session_admin",
  client: "__Host-jz_session_customer",
  employee: "__Host-jz_session_employee",
} as const;

export function sessionCookieMeta(
  role: "admin" | "client" | "employee",
) {
  return {
    name: SESSION_COOKIE_BY_ROLE[role],
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    httpOnly: true as const,
    secure: true as const,
    sameSite: "lax" as const,
    path: "/" as const,
  };
}

export async function loadAuthSubject(
  userId: string,
): Promise<AuthSubject | null> {
  const user = await findActiveUserById(userId);
  if (user === null) {
    return null;
  }
  return toAuthSubject(user);
}

export async function toAuthSubject(user: UserAuthRow): Promise<AuthSubject> {
  let employeeKind: "delivery" | "sales" | null = null;
  let employeeId: string | null = null;
  if (user.role === "employee") {
    const employee = await findEmployeeAuthByUserId(user.id);
    if (employee === null) {
      throw new UnauthorizedError();
    }
    employeeKind = employee.kind;
    employeeId = employee.id;
  }

  return {
    subjectId: user.id,
    role: user.role,
    employeeKind,
    employeeId,
    name: user.name,
    email: user.email,
    title: user.title,
  };
}

export async function resolveActorFromDatabase(input: {
  readonly subjectId: string;
  readonly role: "admin" | "client" | "employee";
  readonly employeeKind: "delivery" | "sales" | null;
}): Promise<Actor> {
  const subject = await loadAuthSubject(input.subjectId);
  if (subject === null) {
    throw new UnauthorizedError();
  }
  if (subject.role !== input.role) {
    throw new UnauthorizedError();
  }
  if (subject.employeeKind !== input.employeeKind) {
    throw new UnauthorizedError();
  }
  return {
    subjectId: subject.subjectId,
    role: subject.role,
    employeeKind: subject.employeeKind,
  };
}

export function requireRoles(
  actor: Actor,
  roles: readonly Actor["role"][],
): void {
  if (!roles.includes(actor.role)) {
    throw new ForbiddenError();
  }
}

export function requireAdmin(actor: Actor): void {
  requireRoles(actor, ["admin"]);
}

export function requireSelfOrAdmin(actor: Actor, subjectId: string): void {
  if (actor.role === "admin") {
    return;
  }
  if (actor.subjectId !== subjectId) {
    throw new ForbiddenError();
  }
}

export function requireEmployeeKinds(
  actor: Actor,
  kinds: readonly NonNullable<Actor["employeeKind"]>[],
): void {
  if (actor.role !== "employee" || actor.employeeKind === null) {
    throw new ForbiddenError();
  }
  if (!kinds.includes(actor.employeeKind)) {
    throw new ForbiddenError();
  }
}
