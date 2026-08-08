import {
  userAdminUpdateSchema,
  userArchiveSchema,
  userCreateSchema,
  userPasswordSetSchema,
  userPublicSchema,
  userRestoreSchema,
  userRoleChangeSchema,
  userSelfUpdateSchema,
  usersListQuerySchema,
  usersListResponseSchema,
  type Actor,
  type UserPublic,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../lib/errors.ts";
import { hashPassword } from "../lib/secrets.ts";
import { revokeAllSessionsForSubject } from "../repositories/sessions.ts";
import * as usersRepo from "../repositories/users.ts";
import { parseInput, resolveVersionWrite } from "./_helpers.ts";
import { requireAdmin, requireSelfOrAdmin } from "./authz.ts";

function toPublic(row: {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly title: string | null;
  readonly role: "admin" | "client" | "employee";
  readonly version: number;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly archived_at: Date | null;
}): UserPublic {
  return userPublicSchema.parse({
    id: row.id,
    email: row.email,
    name: row.name,
    title: row.title,
    role: row.role,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt: row.archived_at === null ? null : row.archived_at.toISOString(),
  });
}

export async function listUsers(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  requireAdmin(actor);
  const query = parseInput(usersListQuerySchema, input);
  const result = await usersRepo.listUsers({
    limit: query.limit,
    offset: query.offset,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.role !== undefined ? { role: query.role } : {}),
    archived: query.archived,
    sort: query.sort,
    dir: query.dir,
  });
  return usersListResponseSchema.parse({
    items: result.items.map(toPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getUser(
  actor: Actor,
  id: string,
): Promise<UserPublic> {
  requireSelfOrAdmin(actor, id);
  if (actor.role !== "admin" && actor.subjectId !== id) {
    throw new ForbiddenError();
  }
  const row =
    actor.role === "admin"
      ? await usersRepo.getUserById(id)
      : await usersRepo.getUserById(id);
  if (row === null || (actor.role !== "admin" && row.archived_at !== null)) {
    throw new NotFoundError("User not found");
  }
  if (actor.role !== "admin" && row.id !== actor.subjectId) {
    throw new ForbiddenError();
  }
  return toPublic(row);
}

export async function createUser(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<UserPublic> {
  requireAdmin(actor);
  const body = parseInput(userCreateSchema, input);
  const passwordHash = await hashPassword(body.password);
  const row = await usersRepo.insertUser({
    email: body.email,
    passwordHash,
    name: body.name,
    title: body.title,
    role: body.role,
  });
  audit({
    action: "user.create",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "users.create",
  });
  return toPublic(row);
}

export async function updateUserAdmin(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<UserPublic> {
  requireAdmin(actor);
  const body = parseInput(userAdminUpdateSchema, input);
  const updated = await usersRepo.updateUserProfile({
    id: body.id,
    version: body.version,
    name: body.name,
    title: body.title,
    email: body.email,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => usersRepo.getUserById(body.id),
    notFoundMessage: "User not found",
    conflictMessage: "User version conflict",
  });
  audit({
    action: "user.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "users.update",
  });
  return toPublic(row);
}

export async function updateUserSelf(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<UserPublic> {
  const body = parseInput(userSelfUpdateSchema, input);
  const updated = await usersRepo.updateUserProfile({
    id: actor.subjectId,
    version: body.version,
    name: body.name,
    title: body.title,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => usersRepo.getUserById(actor.subjectId),
    notFoundMessage: "User not found",
    conflictMessage: "User version conflict",
  });
  audit({
    action: "user.profile.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "users.me.update",
  });
  return toPublic(row);
}

export async function changeUserRole(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<UserPublic> {
  requireAdmin(actor);
  const body = parseInput(userRoleChangeSchema, input);
  if (body.id === actor.subjectId && body.role !== "admin") {
    throw new ConflictError("Cannot remove your own admin role");
  }

  const existing = await usersRepo.getUserById(body.id);
  if (existing === null || existing.archived_at !== null) {
    throw new NotFoundError("User not found");
  }

  if (existing.role === "admin" && body.role !== "admin") {
    const admins = await usersRepo.countActiveAdmins();
    if (admins <= 1) {
      throw new ConflictError("Cannot demote the last active admin");
    }
  }

  if (
    (existing.role === "employee" || body.role === "employee") &&
    existing.role !== body.role
  ) {
    const hasEmployee = await usersRepo.hasActiveEmployeeProfile(body.id);
    if (hasEmployee && body.role !== "employee") {
      throw new ConflictError(
        "Archive employee profile before changing role away from employee",
      );
    }
  }

  if (
    (existing.role === "client" || body.role === "client") &&
    existing.role !== body.role
  ) {
    const hasClient = await usersRepo.hasActiveClientProfile(body.id);
    if (hasClient && body.role !== "client") {
      throw new ConflictError(
        "Archive client profile before changing role away from client",
      );
    }
  }

  const updated = await usersRepo.updateUserRole({
    id: body.id,
    version: body.version,
    role: body.role,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => usersRepo.getUserById(body.id),
    notFoundMessage: "User not found",
    conflictMessage: "User version conflict",
  });
  await revokeAllSessionsForSubject(body.id);
  audit({
    action: "user.role.change",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "users.role",
  });
  return toPublic(row);
}

export async function setUserPassword(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<{ readonly changed: true }> {
  requireAdmin(actor);
  const body = parseInput(userPasswordSetSchema, input);
  const passwordHash = await hashPassword(body.password);
  const updated = await usersRepo.updatePasswordHash({
    userId: body.id,
    passwordHash,
    expectedVersion: body.version,
  });
  await resolveVersionWrite({
    result: updated,
    lookup: () => usersRepo.getUserById(body.id),
    notFoundMessage: "User not found",
    conflictMessage: "User version conflict",
  });
  await revokeAllSessionsForSubject(body.id);
  audit({
    action: "user.password.set",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "users.password",
  });
  return { changed: true };
}

export async function archiveUser(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<UserPublic> {
  requireAdmin(actor);
  const body = parseInput(userArchiveSchema, input);
  if (body.id === actor.subjectId) {
    throw new ConflictError("Cannot archive your own account");
  }

  const existing = await usersRepo.getUserById(body.id);
  if (existing === null || existing.archived_at !== null) {
    throw new NotFoundError("User not found");
  }

  if (existing.role === "admin") {
    const admins = await usersRepo.countActiveAdmins();
    if (admins <= 1) {
      throw new ConflictError("Cannot archive the last active admin");
    }
  }

  if (await usersRepo.hasActiveClientProfile(body.id)) {
    throw new ConflictError(
      "Archive client profile before archiving user",
    );
  }
  if (await usersRepo.hasActiveEmployeeProfile(body.id)) {
    throw new ConflictError(
      "Archive employee profile before archiving user",
    );
  }

  const updated = await usersRepo.archiveUser({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => usersRepo.getUserById(body.id),
    notFoundMessage: "User not found",
    conflictMessage: "User version conflict",
  });
  await revokeAllSessionsForSubject(body.id);
  audit({
    action: "user.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "users.archive",
  });
  return toPublic(row);
}

export async function restoreUser(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<UserPublic> {
  requireAdmin(actor);
  const body = parseInput(userRestoreSchema, input);
  const existing = await usersRepo.getUserById(body.id);
  if (existing === null || existing.archived_at === null) {
    throw new NotFoundError("User not found");
  }
  const updated = await usersRepo.restoreUser({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => usersRepo.getUserById(body.id),
    notFoundMessage: "User not found",
    conflictMessage: "User version conflict",
  });
  audit({
    action: "user.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "users.restore",
  });
  return toPublic(row);
}
