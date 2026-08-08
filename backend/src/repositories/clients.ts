import {
  clientRowSchema,
  type ClientRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { ConflictError, InternalError } from "../lib/errors.ts";
import { isPgCode, parseRow } from "./_parse.ts";

const CLIENT_COLUMNS = `
  c.id, c.user_id, c.company, c.phone, c.status_code, c.member_since,
  c.client_contact_title, c.location, c.plan, c.version,
  c.created_at, c.updated_at, c.archived_at,
  u.name AS user_name, u.email AS user_email
`;

export async function getClientById(
  id: string,
  client?: DbQueryable,
): Promise<ClientRow | null> {
  const result = await query(
    `
      SELECT ${CLIENT_COLUMNS}
      FROM clients c
      INNER JOIN users u ON u.id = c.user_id
      WHERE c.id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(clientRowSchema, row);
}

export async function getActiveClientById(
  id: string,
  client?: DbQueryable,
): Promise<ClientRow | null> {
  const result = await query(
    `
      SELECT ${CLIENT_COLUMNS}
      FROM clients_active c
      INNER JOIN users_active u ON u.id = c.user_id
      WHERE c.id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(clientRowSchema, row);
}

export async function listClients(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly status?: "active" | "paused";
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at" | "updated_at" | "company" | "member_since";
  readonly dir: "asc" | "desc";
  readonly clientIds: "all" | readonly string[];
}): Promise<{ readonly items: readonly ClientRow[]; readonly total: number }> {
  if (input.clientIds !== "all" && input.clientIds.length === 0) {
    return { items: [], total: 0 };
  }

  const sortColumn =
    input.sort === "company"
      ? "c.company"
      : input.sort === "member_since"
        ? "c.member_since"
        : input.sort === "updated_at"
          ? "c.updated_at"
          : "c.created_at";
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.archived === "active") {
    where.push("c.archived_at IS NULL");
  } else if (input.archived === "archived") {
    where.push("c.archived_at IS NOT NULL");
  }
  if (input.status !== undefined) {
    params.push(input.status);
    where.push(`c.status_code = $${params.length}`);
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(c.company ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`,
    );
  }
  if (input.clientIds !== "all") {
    params.push([...input.clientIds]);
    where.push(`c.id = ANY($${params.length}::uuid[])`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${CLIENT_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM clients c
      INNER JOIN users u ON u.id = c.user_id
      ${whereSql}
      ORDER BY ${sortColumn} ${dir}, c.id ASC
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
    items: result.rows.map((row) => parseRow(clientRowSchema, row)),
    total,
  };
}

export async function insertClient(
  input: {
    readonly userId: string;
    readonly company: string;
    readonly phone: string;
    readonly statusCode: "active" | "paused";
    readonly memberSince: string | null;
    readonly clientContactTitle: string;
    readonly location: string;
    readonly plan: string;
  },
  client?: DbQueryable,
): Promise<ClientRow> {
  try {
    const result = await query(
      `
        INSERT INTO clients (
          user_id, company, phone, status_code, member_since,
          client_contact_title, location, plan
        )
        VALUES (
          $1, $2, $3, $4,
          COALESCE($5::date, CURRENT_DATE),
          $6, $7, $8
        )
        RETURNING id
      `,
      [
        input.userId,
        input.company,
        input.phone,
        input.statusCode,
        input.memberSince,
        input.clientContactTitle,
        input.location,
        input.plan,
      ],
      client,
    );
    const id = (result.rows[0] as { id: string } | undefined)?.id;
    if (id === undefined) {
      throw new InternalError("insertClient returned no row");
    }
    const row = await getClientById(id, client);
    if (row === null) {
      throw new InternalError("insertClient could not reload row");
    }
    return row;
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Client profile already exists for user");
    }
    throw err;
  }
}

export async function updateClient(
  input: {
    readonly id: string;
    readonly version: number;
    readonly company: string;
    readonly phone: string;
    readonly statusCode: "active" | "paused";
    readonly memberSince: string;
    readonly clientContactTitle: string;
    readonly location: string;
    readonly plan: string;
  },
  client?: DbQueryable,
): Promise<ClientRow | null> {
  const result = await query(
    `
      UPDATE clients
      SET
        company = $3,
        phone = $4,
        status_code = $5,
        member_since = $6::date,
        client_contact_title = $7,
        location = $8,
        plan = $9,
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
      input.company,
      input.phone,
      input.statusCode,
      input.memberSince,
      input.clientContactTitle,
      input.location,
      input.plan,
    ],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getClientById(id, client);
}

export async function updateClientSelf(
  input: {
    readonly id: string;
    readonly version: number;
    readonly company: string;
    readonly phone: string;
    readonly clientContactTitle: string;
    readonly location: string;
  },
  client?: DbQueryable,
): Promise<ClientRow | null> {
  const result = await query(
    `
      UPDATE clients
      SET
        company = $3,
        phone = $4,
        client_contact_title = $5,
        location = $6,
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
      input.company,
      input.phone,
      input.clientContactTitle,
      input.location,
    ],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getClientById(id, client);
}

export async function archiveClient(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<ClientRow | null> {
  const result = await query(
    `
      UPDATE clients
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
  return getClientById(id, client);
}

export async function restoreClient(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<ClientRow | null> {
  const result = await query(
    `
      UPDATE clients
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
  return getClientById(id, client);
}
