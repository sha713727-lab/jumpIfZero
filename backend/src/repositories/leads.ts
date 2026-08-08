import {
  leadRowSchema,
  type LeadRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";

const LEAD_COLUMNS = `
  id, rep_id, company, contact_name, phone, email, source, status_code, notes,
  version, created_at, updated_at, archived_at
`;

export async function getLeadById(
  id: string,
  client?: DbQueryable,
): Promise<LeadRow | null> {
  const result = await query(
    `
      SELECT ${LEAD_COLUMNS}
      FROM leads
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
  return parseRow(leadRowSchema, row);
}

export async function getActiveLeadById(
  id: string,
  client?: DbQueryable,
): Promise<LeadRow | null> {
  const result = await query(
    `
      SELECT ${LEAD_COLUMNS}
      FROM leads_active
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
  return parseRow(leadRowSchema, row);
}

export async function listLeads(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly status?: string;
  readonly repId?: string;
  readonly repIds: "all" | readonly string[];
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at" | "updated_at" | "company" | "status_code";
  readonly dir: "asc" | "desc";
}): Promise<{ readonly items: readonly LeadRow[]; readonly total: number }> {
  if (input.repIds !== "all" && input.repIds.length === 0) {
    return { items: [], total: 0 };
  }

  const sortColumn =
    input.sort === "company"
      ? "company"
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
  if (input.repId !== undefined) {
    params.push(input.repId);
    where.push(`rep_id = $${params.length}`);
  }
  if (input.repIds !== "all") {
    params.push([...input.repIds]);
    where.push(`rep_id = ANY($${params.length}::uuid[])`);
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(company ILIKE $${params.length} OR contact_name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${LEAD_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM leads
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
    items: result.rows.map((row) => parseRow(leadRowSchema, row)),
    total,
  };
}

export async function insertLead(
  input: {
    readonly repId: string;
    readonly company: string;
    readonly contactName: string;
    readonly phone: string;
    readonly email: string;
    readonly source: string;
    readonly statusCode: string;
    readonly notes: string;
  },
  client?: DbQueryable,
): Promise<LeadRow> {
  const result = await query(
    `
      INSERT INTO leads (
        rep_id, company, contact_name, phone, email, source, status_code, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,
    [
      input.repId,
      input.company,
      input.contactName,
      input.phone,
      input.email,
      input.source,
      input.statusCode,
      input.notes,
    ],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    throw new InternalError("insertLead returned no row");
  }
  const row = await getLeadById(id, client);
  if (row === null) {
    throw new InternalError("insertLead could not reload row");
  }
  return row;
}

export async function updateLead(
  input: {
    readonly id: string;
    readonly version: number;
    readonly company: string;
    readonly contactName: string;
    readonly phone: string;
    readonly email: string;
    readonly source: string;
    readonly notes: string;
  },
  client?: DbQueryable,
): Promise<LeadRow | null> {
  const result = await query(
    `
      UPDATE leads
      SET
        company = $3,
        contact_name = $4,
        phone = $5,
        email = $6,
        source = $7,
        notes = $8,
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
      input.contactName,
      input.phone,
      input.email,
      input.source,
      input.notes,
    ],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getLeadById(id, client);
}

export async function updateLeadStatus(
  input: {
    readonly id: string;
    readonly version: number;
    readonly statusCode: string;
  },
  client?: DbQueryable,
): Promise<LeadRow | null> {
  const result = await query(
    `
      UPDATE leads
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
  return getLeadById(id, client);
}

export async function archiveLead(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<LeadRow | null> {
  const result = await query(
    `
      UPDATE leads
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
  return getLeadById(id, client);
}

export async function restoreLead(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<LeadRow | null> {
  const result = await query(
    `
      UPDATE leads
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
  return getLeadById(id, client);
}
