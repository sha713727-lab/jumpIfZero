import {
  employeeAuthRowSchema,
  userAuthRowSchema,
  userPublicRowSchema,
  type EmployeeAuthRow,
  type UserAuthRow,
  type UserPublicRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { ConflictError, InternalError } from "../lib/errors.ts";
import { isPgCode, parseRow } from "./_parse.ts";

const USER_PUBLIC_COLUMNS = `
  id, email, name, title, role, version, created_at, updated_at, archived_at
`;

export async function findActiveUserByEmail(
  email: string,
  client?: DbQueryable,
): Promise<UserAuthRow | null> {
  const result = await query(
    `
      SELECT id, email, password_hash, name, title, role, version
      FROM users_active
      WHERE email = $1
      LIMIT 1
    `,
    [email.toLowerCase()],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(userAuthRowSchema, row);
}

export async function findActiveUserById(
  id: string,
  client?: DbQueryable,
): Promise<UserAuthRow | null> {
  const result = await query(
    `
      SELECT id, email, password_hash, name, title, role, version
      FROM users_active
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
  return parseRow(userAuthRowSchema, row);
}

export async function findEmployeeAuthByUserId(
  userId: string,
  client?: DbQueryable,
): Promise<EmployeeAuthRow | null> {
  const result = await query(
    `
      SELECT id, kind
      FROM employees_active
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(employeeAuthRowSchema, row);
}

export async function findEmployeeKindByUserId(
  userId: string,
  client?: DbQueryable,
): Promise<"delivery" | "sales" | null> {
  const employee = await findEmployeeAuthByUserId(userId, client);
  return employee?.kind ?? null;
}

export async function updatePasswordHash(input: {
  readonly userId: string;
  readonly passwordHash: string;
  readonly expectedVersion: number;
  readonly client?: DbQueryable;
}): Promise<UserAuthRow | null> {
  const result = await query(
    `
      UPDATE users
      SET
        password_hash = $2,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NULL
        AND version = $3
      RETURNING id, email, password_hash, name, title, role, version
    `,
    [input.userId, input.passwordHash, input.expectedVersion],
    input.client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(userAuthRowSchema, row);
}

export async function getUserById(
  id: string,
  client?: DbQueryable,
): Promise<UserPublicRow | null> {
  const result = await query(
    `
      SELECT ${USER_PUBLIC_COLUMNS}
      FROM users
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
  return parseRow(userPublicRowSchema, row);
}

export async function listUsers(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly role?: "admin" | "client" | "employee";
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at" | "updated_at" | "email" | "name";
  readonly dir: "asc" | "desc";
}): Promise<{ readonly items: readonly UserPublicRow[]; readonly total: number }> {
  const sortColumn =
    input.sort === "email"
      ? "email"
      : input.sort === "name"
        ? "name"
        : input.sort === "updated_at"
          ? "updated_at"
          : "created_at";
  const dir = input.dir === "asc" ? "ASC" : "DESC";

  const filters: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (input.archived === "active") {
    filters.push("archived_at IS NULL");
  } else if (input.archived === "archived") {
    filters.push("archived_at IS NOT NULL");
  }

  if (input.role !== undefined) {
    filters.push(`role = $${i}`);
    values.push(input.role);
    i += 1;
  }

  if (input.q !== undefined && input.q.length > 0) {
    filters.push(
      `(email ILIKE $${i} OR name ILIKE $${i} OR COALESCE(title, '') ILIKE $${i})`,
    );
    values.push(`%${input.q}%`);
    i += 1;
  }

  const where =
    filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  const countResult = await query<{ total: string }>(
    `
      SELECT count(*)::text AS total
      FROM users
      ${where}
    `,
    values,
  );
  const total = Number(countResult.rows[0]?.total ?? "0");

  const listValues = [...values, input.limit, input.offset];
  const result = await query(
    `
      SELECT ${USER_PUBLIC_COLUMNS}
      FROM users
      ${where}
      ORDER BY ${sortColumn} ${dir}, id ${dir}
      LIMIT $${i} OFFSET $${i + 1}
    `,
    listValues,
  );

  return {
    items: result.rows.map((row) => parseRow(userPublicRowSchema, row)),
    total,
  };
}

export async function insertUser(input: {
  readonly email: string;
  readonly passwordHash: string;
  readonly name: string;
  readonly title: string | null;
  readonly role: "admin" | "client" | "employee";
  readonly client?: DbQueryable;
}): Promise<UserPublicRow> {
  try {
    const result = await query(
      `
        INSERT INTO users (email, password_hash, name, title, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING ${USER_PUBLIC_COLUMNS}
      `,
      [
        input.email.toLowerCase(),
        input.passwordHash,
        input.name,
        input.title,
        input.role,
      ],
      input.client,
    );
    const row = result.rows[0];
    if (row === undefined) {
      throw new InternalError("insertUser returned no row");
    }
    return parseRow(userPublicRowSchema, row);
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Email already in use");
    }
    throw err;
  }
}

export async function updateUserProfile(input: {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly title: string | null;
  readonly email?: string;
  readonly client?: DbQueryable;
}): Promise<UserPublicRow | null> {
  try {
    const result =
      input.email !== undefined
        ? await query(
            `
              UPDATE users
              SET
                name = $2,
                title = $3,
                email = $4,
                version = version + 1,
                updated_at = now()
              WHERE id = $1
                AND archived_at IS NULL
                AND version = $5
              RETURNING ${USER_PUBLIC_COLUMNS}
            `,
            [
              input.id,
              input.name,
              input.title,
              input.email.toLowerCase(),
              input.version,
            ],
            input.client,
          )
        : await query(
            `
              UPDATE users
              SET
                name = $2,
                title = $3,
                version = version + 1,
                updated_at = now()
              WHERE id = $1
                AND archived_at IS NULL
                AND version = $4
              RETURNING ${USER_PUBLIC_COLUMNS}
            `,
            [input.id, input.name, input.title, input.version],
            input.client,
          );
    const row = result.rows[0];
    if (row === undefined) {
      return null;
    }
    return parseRow(userPublicRowSchema, row);
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Email already in use");
    }
    throw err;
  }
}

export async function updateUserRole(input: {
  readonly id: string;
  readonly version: number;
  readonly role: "admin" | "client" | "employee";
  readonly client?: DbQueryable;
}): Promise<UserPublicRow | null> {
  const result = await query(
    `
      UPDATE users
      SET
        role = $2,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NULL
        AND version = $3
      RETURNING ${USER_PUBLIC_COLUMNS}
    `,
    [input.id, input.role, input.version],
    input.client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(userPublicRowSchema, row);
}

export async function archiveUser(input: {
  readonly id: string;
  readonly version: number;
  readonly client?: DbQueryable;
}): Promise<UserPublicRow | null> {
  const result = await query(
    `
      UPDATE users
      SET
        archived_at = now(),
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NULL
        AND version = $2
      RETURNING ${USER_PUBLIC_COLUMNS}
    `,
    [input.id, input.version],
    input.client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(userPublicRowSchema, row);
}

export async function restoreUser(input: {
  readonly id: string;
  readonly version: number;
  readonly client?: DbQueryable;
}): Promise<UserPublicRow | null> {
  try {
    const result = await query(
      `
        UPDATE users
        SET
          archived_at = NULL,
          version = version + 1,
          updated_at = now()
        WHERE id = $1
          AND archived_at IS NOT NULL
          AND version = $2
        RETURNING ${USER_PUBLIC_COLUMNS}
      `,
      [input.id, input.version],
      input.client,
    );
    const row = result.rows[0];
    if (row === undefined) {
      return null;
    }
    return parseRow(userPublicRowSchema, row);
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Email already in use");
    }
    throw err;
  }
}

export async function hasActiveClientProfile(
  userId: string,
  client?: DbQueryable,
): Promise<boolean> {
  const result = await query(
    `
      SELECT 1
      FROM clients
      WHERE user_id = $1
        AND archived_at IS NULL
      LIMIT 1
    `,
    [userId],
    client,
  );
  return result.rows.length > 0;
}

export async function hasActiveEmployeeProfile(
  userId: string,
  client?: DbQueryable,
): Promise<boolean> {
  const result = await query(
    `
      SELECT 1
      FROM employees
      WHERE user_id = $1
        AND archived_at IS NULL
      LIMIT 1
    `,
    [userId],
    client,
  );
  return result.rows.length > 0;
}

export async function countActiveAdmins(
  client?: DbQueryable,
): Promise<number> {
  const result = await query<{ total: string }>(
    `
      SELECT count(*)::text AS total
      FROM users_active
      WHERE role = 'admin'
    `,
    [],
    client,
  );
  return Number(result.rows[0]?.total ?? "0");
}
