import {
  employeeArchiveSchema,
  employeeCreateSchema,
  employeeKindChangeSchema,
  employeePublicSchema,
  employeeRestoreSchema,
  employeeSelfImageUpdateSchema,
  employeeUpdateSchema,
  employeesListQuerySchema,
  employeesListResponseSchema,
  type Actor,
  type EmployeePublic,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../lib/errors.ts";
import type { EmployeePublicRow } from "@jumpifzero/contracts";
import * as employeesRepo from "../repositories/employees.ts";
import * as usersRepo from "../repositories/users.ts";
import { parseInput, resolveVersionWrite } from "./_helpers.ts";
import { requireAdmin } from "./authz.ts";

function toPublic(row: EmployeePublicRow): EmployeePublic {
  const base = {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    department: row.department,
    kind: row.kind,
    imagePath: row.image_path,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt: row.archived_at === null ? null : row.archived_at.toISOString(),
  };
  if (
    row.user_email !== undefined &&
    row.user_name !== undefined
  ) {
    return employeePublicSchema.parse({
      ...base,
      user: {
        email: row.user_email,
        name: row.user_name,
        title: row.user_title ?? null,
        role: "employee" as const,
      },
    });
  }
  return employeePublicSchema.parse(base);
}

export async function listEmployees(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  const query = parseInput(employeesListQuerySchema, input);

  if (actor.role === "employee" && actor.employeeKind === "sales") {
    const result = await employeesRepo.listEmployees({
      limit: query.limit,
      offset: query.offset,
      ...(query.q !== undefined ? { q: query.q } : {}),
      kind: "sales",
      archived: "active",
      sort: query.sort,
      dir: query.dir,
    });
    return employeesListResponseSchema.parse({
      items: result.items.map(toPublic),
      total: result.total,
      limit: query.limit,
      offset: query.offset,
    });
  }

  requireAdmin(actor);
  const result = await employeesRepo.listEmployees({
    limit: query.limit,
    offset: query.offset,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.kind !== undefined ? { kind: query.kind } : {}),
    archived: query.archived,
    sort: query.sort,
    dir: query.dir,
  });
  return employeesListResponseSchema.parse({
    items: result.items.map(toPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getEmployee(
  actor: Actor,
  id: string,
): Promise<EmployeePublic> {
  const row = await employeesRepo.getEmployeeById(id);
  if (row === null) {
    throw new NotFoundError("Employee not found");
  }

  if (actor.role === "admin") {
    return toPublic(row);
  }

  if (actor.role !== "employee" || row.user_id !== actor.subjectId) {
    throw new ForbiddenError();
  }
  if (row.archived_at !== null) {
    throw new NotFoundError("Employee not found");
  }
  return toPublic(row);
}

export async function createEmployee(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<EmployeePublic> {
  requireAdmin(actor);
  const body = parseInput(employeeCreateSchema, input);
  const user = await usersRepo.findActiveUserById(body.userId);
  if (user === null) {
    throw new NotFoundError("User not found");
  }
  if (user.role !== "employee") {
    throw new ConflictError("User role must be employee");
  }
  const existing = await employeesRepo.getEmployeeByUserId(body.userId);
  if (existing !== null) {
    if (existing.archived_at === null) {
      throw new ConflictError("User already has an employee profile");
    }
    throw new ConflictError("Restore the archived employee profile instead");
  }

  const row = await employeesRepo.insertEmployee({
    userId: body.userId,
    title: body.title,
    department: body.department,
    kind: body.kind,
    imagePath: body.imagePath,
  });
  audit({
    action: "employee.create",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "employees.create",
  });
  return toPublic(row);
}

export async function updateEmployee(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<EmployeePublic> {
  requireAdmin(actor);
  const body = parseInput(employeeUpdateSchema, input);
  const updated = await employeesRepo.updateEmployee({
    id: body.id,
    version: body.version,
    title: body.title,
    department: body.department,
    imagePath: body.imagePath,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => employeesRepo.getEmployeeById(body.id),
    notFoundMessage: "Employee not found",
    conflictMessage: "Employee version conflict",
  });
  audit({
    action: "employee.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "employees.update",
  });
  return toPublic(row);
}

export async function updateEmployeeSelfImage(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<EmployeePublic> {
  if (
    actor.role !== "employee" ||
    (actor.employeeKind !== "delivery" && actor.employeeKind !== "sales")
  ) {
    throw new ForbiddenError();
  }
  const body = parseInput(employeeSelfImageUpdateSchema, input);
  const existing = await employeesRepo.getActiveEmployeeByUserId(
    actor.subjectId,
  );
  if (existing === null) {
    throw new NotFoundError("Employee not found");
  }
  const updated = await employeesRepo.updateEmployeeImagePath({
    id: existing.id,
    version: body.version,
    imagePath: body.imagePath,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => employeesRepo.getEmployeeById(existing.id),
    notFoundMessage: "Employee not found",
    conflictMessage: "Employee version conflict",
  });
  audit({
    action: "employee.self_image.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "employees.me.image",
  });
  return toPublic(row);
}

export async function changeEmployeeKind(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<EmployeePublic> {
  requireAdmin(actor);
  const body = parseInput(employeeKindChangeSchema, input);
  const updated = await employeesRepo.updateEmployeeKind({
    id: body.id,
    version: body.version,
    kind: body.kind,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => employeesRepo.getEmployeeById(body.id),
    notFoundMessage: "Employee not found",
    conflictMessage: "Employee version conflict",
  });
  audit({
    action: "employee.kind.change",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "employees.kind",
  });
  return toPublic(row);
}

export async function archiveEmployee(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<EmployeePublic> {
  requireAdmin(actor);
  const body = parseInput(employeeArchiveSchema, input);
  const updated = await employeesRepo.archiveEmployee({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => employeesRepo.getEmployeeById(body.id),
    notFoundMessage: "Employee not found",
    conflictMessage: "Employee version conflict",
  });
  audit({
    action: "employee.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "employees.archive",
  });
  return toPublic(row);
}

export async function restoreEmployee(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<EmployeePublic> {
  requireAdmin(actor);
  const body = parseInput(employeeRestoreSchema, input);
  const existing = await employeesRepo.getEmployeeById(body.id);
  if (existing === null || existing.archived_at === null) {
    throw new NotFoundError("Employee not found");
  }
  const user = await usersRepo.findActiveUserById(existing.user_id);
  if (user === null) {
    throw new ConflictError("Restore user before restoring employee");
  }
  if (user.role !== "employee") {
    throw new ConflictError("User role must be employee");
  }
  const active = await employeesRepo.getActiveEmployeeByUserId(existing.user_id);
  if (active !== null && active.id !== existing.id) {
    throw new ConflictError("User already has an active employee profile");
  }

  const updated = await employeesRepo.restoreEmployee({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => employeesRepo.getEmployeeById(body.id),
    notFoundMessage: "Employee not found",
    conflictMessage: "Employee version conflict",
  });
  audit({
    action: "employee.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "employees.restore",
  });
  return toPublic(row);
}
