import {
  projectRowSchema,
  type ProjectRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";

const PROJECT_COLUMNS = `
  id, client_id, service_id, title, status_code, notes,
  manager_employee_id, next_milestone, next_milestone_date, progress,
  version, created_at, updated_at, archived_at
`;

export async function getProjectById(
  id: string,
  client?: DbQueryable,
): Promise<ProjectRow | null> {
  const result = await query(
    `
      SELECT ${PROJECT_COLUMNS}
      FROM projects
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(projectRowSchema, row);
}

export async function listProjects(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly clientId?: string;
  readonly status?: "requested" | "approved" | "in_progress" | "completed";
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at" | "updated_at" | "title" | "status_code";
  readonly dir: "asc" | "desc";
  readonly clientIds: "all" | readonly string[];
}): Promise<{ readonly items: readonly ProjectRow[]; readonly total: number }> {
  if (input.clientIds !== "all" && input.clientIds.length === 0) {
    return { items: [], total: 0 };
  }

  const sortColumn =
    input.sort === "title"
      ? "title"
      : input.sort === "status_code"
        ? "status_code"
        : input.sort === "updated_at"
          ? "updated_at"
          : "created_at";
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.archived === "active") {
    where.push("archived_at IS NULL");
  } else if (input.archived === "archived") {
    where.push("archived_at IS NOT NULL");
  }
  if (input.status !== undefined) {
    params.push(input.status);
    where.push(`status_code = $${params.length}`);
  }
  if (input.clientId !== undefined) {
    params.push(input.clientId);
    where.push(`client_id = $${params.length}`);
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(`title ILIKE $${params.length}`);
  }
  if (input.clientIds !== "all") {
    params.push([...input.clientIds]);
    where.push(`client_id = ANY($${params.length}::uuid[])`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${PROJECT_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM projects
      ${whereSql}
      ORDER BY ${sortColumn} ${dir}, id ASC
      LIMIT $${limitIdx}
      OFFSET $${offsetIdx}
    `,
    params,
  );

  const total =
    result.rows.length === 0
      ? 0
      : Number((result.rows[0] as { total_count: number }).total_count);

  return {
    items: result.rows.map((row) => parseRow(projectRowSchema, row)),
    total,
  };
}

export async function insertProject(
  input: {
    readonly clientId: string;
    readonly serviceId: string;
    readonly title: string;
    readonly statusCode: "requested" | "approved" | "in_progress" | "completed";
    readonly notes: string;
    readonly managerEmployeeId: string | null;
    readonly nextMilestone: string;
    readonly nextMilestoneDate: string | null;
    readonly progress: number;
  },
  client?: DbQueryable,
): Promise<ProjectRow> {
  const result = await query(
    `
      INSERT INTO projects (
        client_id, service_id, title, status_code, notes,
        manager_employee_id, next_milestone, next_milestone_date, progress
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9)
      RETURNING id
    `,
    [
      input.clientId,
      input.serviceId,
      input.title,
      input.statusCode,
      input.notes,
      input.managerEmployeeId,
      input.nextMilestone,
      input.nextMilestoneDate,
      input.progress,
    ],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    throw new InternalError("insertProject returned no row");
  }
  const row = await getProjectById(id, client);
  if (row === null) {
    throw new InternalError("insertProject could not reload row");
  }
  return row;
}

export async function updateProject(
  input: {
    readonly id: string;
    readonly version: number;
    readonly title: string;
    readonly notes: string;
    readonly managerEmployeeId: string | null;
    readonly nextMilestone: string;
    readonly nextMilestoneDate: string | null;
    readonly progress: number;
  },
  client?: DbQueryable,
): Promise<ProjectRow | null> {
  const result = await query(
    `
      UPDATE projects
      SET
        title = $3,
        notes = $4,
        manager_employee_id = $5,
        next_milestone = $6,
        next_milestone_date = $7::date,
        progress = $8,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
      RETURNING id
    `,
    [
      input.id,
      input.version,
      input.title,
      input.notes,
      input.managerEmployeeId,
      input.nextMilestone,
      input.nextMilestoneDate,
      input.progress,
    ],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getProjectById(id, client);
}

export async function updateProjectStatus(
  input: {
    readonly id: string;
    readonly version: number;
    readonly statusCode: "requested" | "approved" | "in_progress" | "completed";
  },
  client?: DbQueryable,
): Promise<ProjectRow | null> {
  const result = await query(
    `
      UPDATE projects
      SET
        status_code = $3,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
      RETURNING id
    `,
    [input.id, input.version, input.statusCode],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getProjectById(id, client);
}

export async function archiveProject(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<ProjectRow | null> {
  const result = await query(
    `
      UPDATE projects
      SET
        archived_at = now(),
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
      RETURNING id
    `,
    [input.id, input.version],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getProjectById(id, client);
}

export async function restoreProject(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<ProjectRow | null> {
  const result = await query(
    `
      UPDATE projects
      SET
        archived_at = NULL,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NOT NULL
      RETURNING id
    `,
    [input.id, input.version],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getProjectById(id, client);
}

export async function activeServiceExists(
  serviceId: string,
  client?: DbQueryable,
): Promise<boolean> {
  const result = await query(
    `
      SELECT 1
      FROM services_active
      WHERE id = $1
      LIMIT 1
    `,
    [serviceId],
    client,
  );
  return result.rows.length > 0;
}
