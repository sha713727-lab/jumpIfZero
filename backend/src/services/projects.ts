import {
  projectArchiveSchema,
  projectCreateSchema,
  projectPublicSchema,
  projectRestoreSchema,
  projectsListQuerySchema,
  projectsListResponseSchema,
  projectStatusChangeSchema,
  projectUpdateSchema,
  type Actor,
  type ProjectPublic,
  type ProjectRow,
} from "@jumpifzero/contracts";
import {
  ConflictError,
  NotFoundError,
} from "../lib/errors.ts";
import * as clientsRepo from "../repositories/clients.ts";
import * as projectsRepo from "../repositories/projects.ts";
import {
  accessibleClientIds,
  assertCanAccessClient,
  requireDeliveryOrAdmin,
} from "./access.ts";
import { parseInput, resolveVersionWrite } from "./_helpers.ts";

const STATUS_ORDER = [
  "requested",
  "approved",
  "in_progress",
  "completed",
] as const;

function dateOnly(value: Date | null): string | null {
  if (value === null) {
    return null;
  }
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toPublic(row: ProjectRow): ProjectPublic {
  return projectPublicSchema.parse({
    id: row.id,
    clientId: row.client_id,
    serviceId: row.service_id,
    title: row.title,
    statusCode: row.status_code,
    notes: row.notes,
    managerEmployeeId: row.manager_employee_id,
    nextMilestone: row.next_milestone,
    nextMilestoneDate: dateOnly(row.next_milestone_date),
    progress: row.progress,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt:
      row.archived_at === null ? null : row.archived_at.toISOString(),
  });
}

function assertForwardStatus(
  from: (typeof STATUS_ORDER)[number],
  to: (typeof STATUS_ORDER)[number],
): void {
  if (from === to) {
    return;
  }
  const fromIdx = STATUS_ORDER.indexOf(from);
  const toIdx = STATUS_ORDER.indexOf(to);
  if (toIdx !== fromIdx + 1) {
    throw new ConflictError("Invalid project status transition");
  }
}

export async function listProjects(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  const query = parseInput(projectsListQuerySchema, input);
  const clientIds = await accessibleClientIds(actor);
  if (query.clientId !== undefined) {
    await assertCanAccessClient(actor, query.clientId);
  }
  const result = await projectsRepo.listProjects({
    limit: query.limit,
    offset: query.offset,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.clientId !== undefined ? { clientId: query.clientId } : {}),
    ...(query.status !== undefined ? { status: query.status } : {}),
    archived: query.archived,
    sort: query.sort,
    dir: query.dir,
    clientIds,
  });
  return projectsListResponseSchema.parse({
    items: result.items.map(toPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getProject(
  actor: Actor,
  id: string,
): Promise<ProjectPublic> {
  const row = await projectsRepo.getProjectById(id);
  if (row === null || (actor.role !== "admin" && row.archived_at !== null)) {
    throw new NotFoundError("Project not found");
  }
  await assertCanAccessClient(actor, row.client_id);
  return toPublic(row);
}

export async function createProject(
  actor: Actor,
  input: unknown,
): Promise<ProjectPublic> {
  await requireDeliveryOrAdmin(actor);
  const body = parseInput(projectCreateSchema, input);
  await assertCanAccessClient(actor, body.clientId);
  const client = await clientsRepo.getActiveClientById(body.clientId);
  if (client === null) {
    throw new NotFoundError("Client not found");
  }
  if (!(await projectsRepo.activeServiceExists(body.serviceId))) {
    throw new NotFoundError("Service not found");
  }
  if (body.statusCode !== "requested") {
    throw new ConflictError("New projects must start as requested");
  }
  const row = await projectsRepo.insertProject({
    clientId: body.clientId,
    serviceId: body.serviceId,
    title: body.title,
    statusCode: body.statusCode,
    notes: body.notes,
    managerEmployeeId: body.managerEmployeeId,
    nextMilestone: body.nextMilestone,
    nextMilestoneDate: body.nextMilestoneDate,
    progress: body.progress,
  });
  return toPublic(row);
}

export async function updateProject(
  actor: Actor,
  input: unknown,
): Promise<ProjectPublic> {
  await requireDeliveryOrAdmin(actor);
  const body = parseInput(projectUpdateSchema, input);
  const existing = await projectsRepo.getProjectById(body.id);
  if (existing === null || existing.archived_at !== null) {
    throw new NotFoundError("Project not found");
  }
  await assertCanAccessClient(actor, existing.client_id);
  const updated = await projectsRepo.updateProject({
    id: body.id,
    version: body.version,
    title: body.title,
    notes: body.notes,
    managerEmployeeId: body.managerEmployeeId,
    nextMilestone: body.nextMilestone,
    nextMilestoneDate: body.nextMilestoneDate,
    progress: body.progress,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => projectsRepo.getProjectById(body.id),
    notFoundMessage: "Project not found",
    conflictMessage: "Project version conflict",
  });
  return toPublic(row);
}

export async function changeProjectStatus(
  actor: Actor,
  input: unknown,
): Promise<ProjectPublic> {
  await requireDeliveryOrAdmin(actor);
  const body = parseInput(projectStatusChangeSchema, input);
  const existing = await projectsRepo.getProjectById(body.id);
  if (existing === null || existing.archived_at !== null) {
    throw new NotFoundError("Project not found");
  }
  await assertCanAccessClient(actor, existing.client_id);
  assertForwardStatus(existing.status_code, body.statusCode);
  const updated = await projectsRepo.updateProjectStatus({
    id: body.id,
    version: body.version,
    statusCode: body.statusCode,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => projectsRepo.getProjectById(body.id),
    notFoundMessage: "Project not found",
    conflictMessage: "Project version conflict",
  });
  return toPublic(row);
}

export async function archiveProject(
  actor: Actor,
  input: unknown,
): Promise<ProjectPublic> {
  await requireDeliveryOrAdmin(actor);
  const body = parseInput(projectArchiveSchema, input);
  const existing = await projectsRepo.getProjectById(body.id);
  if (existing === null) {
    throw new NotFoundError("Project not found");
  }
  await assertCanAccessClient(actor, existing.client_id);
  const archived = await projectsRepo.archiveProject({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: archived,
    lookup: () => projectsRepo.getProjectById(body.id),
    notFoundMessage: "Project not found",
    conflictMessage: "Project version conflict",
  });
  return toPublic(row);
}

export async function restoreProject(
  actor: Actor,
  input: unknown,
): Promise<ProjectPublic> {
  await requireDeliveryOrAdmin(actor);
  const body = parseInput(projectRestoreSchema, input);
  const existing = await projectsRepo.getProjectById(body.id);
  if (existing === null) {
    throw new NotFoundError("Project not found");
  }
  await assertCanAccessClient(actor, existing.client_id);
  const restored = await projectsRepo.restoreProject({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => projectsRepo.getProjectById(body.id),
    notFoundMessage: "Project not found",
    conflictMessage: "Project version conflict",
  });
  return toPublic(row);
}
