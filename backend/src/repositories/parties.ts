import {
  partyRowSchema,
  type PartyRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";

const PARTY_COLUMNS = `
  id, kind, name, phone, street, city_state_zip, email,
  version, created_at, updated_at, archived_at
`;

export async function getPartyById(
  id: string,
  client?: DbQueryable,
): Promise<PartyRow | null> {
  const result = await query(
    `
      SELECT ${PARTY_COLUMNS}
      FROM parties
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
  return parseRow(partyRowSchema, row);
}

export async function getActivePartyById(
  id: string,
  client?: DbQueryable,
): Promise<PartyRow | null> {
  const result = await query(
    `
      SELECT ${PARTY_COLUMNS}
      FROM parties_active
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
  return parseRow(partyRowSchema, row);
}

export async function listParties(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly kind?: "insurance" | "factoring";
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at" | "updated_at" | "name" | "kind";
  readonly dir: "asc" | "desc";
}): Promise<{ readonly items: readonly PartyRow[]; readonly total: number }> {
  const sortColumn =
    input.sort === "name"
      ? "name"
      : input.sort === "kind"
        ? "kind"
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
  if (input.kind !== undefined) {
    params.push(input.kind);
    where.push(`kind = $${params.length}`);
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${PARTY_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM parties
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
    items: result.rows.map((row) => parseRow(partyRowSchema, row)),
    total,
  };
}

export async function insertParty(
  input: {
    readonly kind: "insurance" | "factoring";
    readonly name: string;
    readonly phone: string;
    readonly street: string;
    readonly cityStateZip: string;
    readonly email: string;
  },
  client?: DbQueryable,
): Promise<PartyRow> {
  const result = await query(
    `
      INSERT INTO parties (kind, name, phone, street, city_state_zip, email)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [
      input.kind,
      input.name,
      input.phone,
      input.street,
      input.cityStateZip,
      input.email,
    ],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    throw new InternalError("insertParty returned no row");
  }
  const row = await getPartyById(id, client);
  if (row === null) {
    throw new InternalError("insertParty could not reload row");
  }
  return row;
}

export async function updateParty(
  input: {
    readonly id: string;
    readonly version: number;
    readonly name: string;
    readonly phone: string;
    readonly street: string;
    readonly cityStateZip: string;
    readonly email: string;
  },
  client?: DbQueryable,
): Promise<PartyRow | null> {
  const result = await query(
    `
      UPDATE parties
      SET
        name = $3,
        phone = $4,
        street = $5,
        city_state_zip = $6,
        email = $7,
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
      input.name,
      input.phone,
      input.street,
      input.cityStateZip,
      input.email,
    ],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getPartyById(id, client);
}

export async function archiveParty(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<PartyRow | null> {
  const result = await query(
    `
      UPDATE parties
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
  return getPartyById(id, client);
}

export async function restoreParty(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<PartyRow | null> {
  const result = await query(
    `
      UPDATE parties
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
  return getPartyById(id, client);
}

export async function nullifyPartyReferencesOnActiveSales(
  partyId: string,
  client?: DbQueryable,
): Promise<void> {
  await query(
    `
      UPDATE sales
      SET
        insurance_party_id = CASE
          WHEN insurance_party_id = $1 THEN NULL
          ELSE insurance_party_id
        END,
        factoring_party_id = CASE
          WHEN factoring_party_id = $1 THEN NULL
          ELSE factoring_party_id
        END,
        version = version + 1,
        updated_at = now()
      WHERE archived_at IS NULL
        AND (insurance_party_id = $1 OR factoring_party_id = $1)
    `,
    [partyId],
    client,
  );
}
