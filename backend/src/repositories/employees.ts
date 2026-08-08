import {
  employeePublicRowSchema,
  type EmployeePublicRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { ConflictError, InternalError } from "../lib/errors.ts";
import { isPgCode, parseRow } from "./_parse.ts";

const EMPLOYEE_COLUMNS = `
  e.id, e.user_id, e.title, e.department, e.kind, e.image_path,
  e.version, e.created_at, e.updated_at, e.archived_at,
  u.email AS user_email, u.name AS user_name, u.title AS user_title
`;

export async function getEmployeeById(
  id: string,
  client?: DbQueryable,
): Promise<EmployeePublicRow | null> {
  const result = await query(
    `
      SELECT ${EMPLOYEE_COLUMNS}
      FROM employees e
      INNER JOIN users u ON u.id = e.user_id
      WHERE e.id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(employeePublicRowSchema, row);
}

export async function getEmployeeByUserId(
  userId: string,
  client?: DbQueryable,
): Promise<EmployeePublicRow | null> {
  const result = await query(
    `
      SELECT ${EMPLOYEE_COLUMNS}
      FROM employees e
      INNER JOIN users u ON u.id = e.user_id
      WHERE e.user_id = $1
      LIMIT 1
    `,
    [userId],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(employeePublicRowSchema, row);
}

export async function getActiveEmployeeByUserId(
  userId: string,
  client?: DbQueryable,
): Promise<EmployeePublicRow | null> {
  const result = await query(
    `
      SELECT ${EMPLOYEE_COLUMNS}
      FROM employees_active e
      INNER JOIN users_active u ON u.id = e.user_id
      WHERE e.user_id = $1
      LIMIT 1
    `,
    [userId],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(employeePublicRowSchema, row);
}

export async function listEmployees(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly kind?: "delivery" | "sales";
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at" | "updated_at" | "kind";
  readonly dir: "asc" | "desc";
}): Promise<{
  readonly items: readonly EmployeePublicRow[];
  readonly total: number;
}> {
  const sortColumn =
    input.sort === "kind"
      ? "e.kind"
      : input.sort === "updated_at"
        ? "e.updated_at"
        : "e.created_at";
  const dir = input.dir === "asc" ? "ASC" : "DESC";

  const filters: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (input.archived === "active") {
    filters.push("e.archived_at IS NULL");
  } else if (input.archived === "archived") {
    filters.push("e.archived_at IS NOT NULL");
  }

  if (input.kind !== undefined) {
    filters.push(`e.kind = $${i}`);
    values.push(input.kind);
    i += 1;
  }

  if (input.q !== undefined && input.q.length > 0) {
    filters.push(
      `(u.email ILIKE $${i} OR u.name ILIKE $${i} OR e.title ILIKE $${i} OR e.department ILIKE $${i})`,
    );
    values.push(`%${input.q}%`);
    i += 1;
  }

  const where =
    filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  const countResult = await query<{ total: string }>(
    `
      SELECT count(*)::text AS total
      FROM employees e
      INNER JOIN users u ON u.id = e.user_id
      ${where}
    `,
    values,
  );
  const total = Number(countResult.rows[0]?.total ?? "0");

  const listValues = [...values, input.limit, input.offset];
  const result = await query(
    `
      SELECT ${EMPLOYEE_COLUMNS}
      FROM employees e
      INNER JOIN users u ON u.id = e.user_id
      ${where}
      ORDER BY ${sortColumn} ${dir}, e.id ${dir}
      LIMIT $${i} OFFSET $${i + 1}
    `,
    listValues,
  );

  return {
    items: result.rows.map((row) => parseRow(employeePublicRowSchema, row)),
    total,
  };
}

export async function insertEmployee(input: {
  readonly userId: string;
  readonly title: string;
  readonly department: string;
  readonly kind: "delivery" | "sales";
  readonly imagePath: string;
  readonly client?: DbQueryable;
}): Promise<EmployeePublicRow> {
  try {
    const result = await query(
      `
        INSERT INTO employees (user_id, title, department, kind, image_path)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [
        input.userId,
        input.title,
        input.department,
        input.kind,
        input.imagePath,
      ],
      input.client,
    );
    const id = result.rows[0]?.id;
    if (typeof id !== "string") {
      throw new InternalError("insertEmployee returned no id");
    }
    const created = await getEmployeeById(id, input.client);
    if (created === null) {
      throw new InternalError("Employee not visible after insert");
    }
    return created;
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("User already has an employee profile");
    }
    throw err;
  }
}

export async function updateEmployee(input: {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly department: string;
  readonly imagePath: string;
  readonly client?: DbQueryable;
}): Promise<EmployeePublicRow | null> {
  const result = await query(
    `
      UPDATE employees
      SET
        title = $2,
        department = $3,
        image_path = $4,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NULL
        AND version = $5
      RETURNING id
    `,
    [
      input.id,
      input.title,
      input.department,
      input.imagePath,
      input.version,
    ],
    input.client,
  );
  const id = result.rows[0]?.id;
  if (typeof id !== "string") {
    return null;
  }
  return getEmployeeById(id, input.client);
}

export async function updateEmployeeKind(input: {
  readonly id: string;
  readonly version: number;
  readonly kind: "delivery" | "sales";
  readonly client?: DbQueryable;
}): Promise<EmployeePublicRow | null> {
  const result = await query(
    `
      UPDATE employees
      SET
        kind = $2,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NULL
        AND version = $3
      RETURNING id
    `,
    [input.id, input.kind, input.version],
    input.client,
  );
  const id = result.rows[0]?.id;
  if (typeof id !== "string") {
    return null;
  }
  return getEmployeeById(id, input.client);
}

export async function archiveEmployee(input: {
  readonly id: string;
  readonly version: number;
  readonly client?: DbQueryable;
}): Promise<EmployeePublicRow | null> {
  const result = await query(
    `
      UPDATE employees
      SET
        archived_at = now(),
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NULL
        AND version = $2
      RETURNING id
    `,
    [input.id, input.version],
    input.client,
  );
  const id = result.rows[0]?.id;
  if (typeof id !== "string") {
    return null;
  }
  return getEmployeeById(id, input.client);
}

export async function restoreEmployee(input: {
  readonly id: string;
  readonly version: number;
  readonly client?: DbQueryable;
}): Promise<EmployeePublicRow | null> {
  const result = await query(
    `
      UPDATE employees
      SET
        archived_at = NULL,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NOT NULL
        AND version = $2
      RETURNING id
    `,
    [input.id, input.version],
    input.client,
  );
  const id = result.rows[0]?.id;
  if (typeof id !== "string") {
    return null;
  }
  return getEmployeeById(id, input.client);
}

export async function countActiveSalesEmployees(
  employeeIds: readonly string[],
  client?: DbQueryable,
): Promise<number> {
  const uniqueIds = [...new Set(employeeIds)];
  if (uniqueIds.length === 0) {
    return 0;
  }
  const result = await query<{ count: number }>(
    `
      SELECT COUNT(*)::int AS count
      FROM employees_active
      WHERE id = ANY($1::uuid[])
        AND kind = 'sales'
    `,
    [uniqueIds],
    client,
  );
  return Number(result.rows[0]?.count ?? 0);
}
