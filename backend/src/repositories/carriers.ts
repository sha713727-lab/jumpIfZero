import {
  carrierRowSchema,
  type CarrierRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { ConflictError, InternalError } from "../lib/errors.ts";
import { isPgCode, parseRow } from "./_parse.ts";

const CARRIER_COLUMNS = `
  id, us_dot, mc, legal_name, dba, business_address, owner_operator_driver,
  tax_id_ciphertext, business_telephone, version, created_at, updated_at, archived_at
`;

export async function getCarrierById(
  id: string,
  client?: DbQueryable,
): Promise<CarrierRow | null> {
  const result = await query(
    `
      SELECT ${CARRIER_COLUMNS}
      FROM carriers
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
  return parseRow(carrierRowSchema, row);
}

export async function getActiveCarrierById(
  id: string,
  client?: DbQueryable,
): Promise<CarrierRow | null> {
  const result = await query(
    `
      SELECT ${CARRIER_COLUMNS}
      FROM carriers_active
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
  return parseRow(carrierRowSchema, row);
}

export async function findActiveByUsDot(
  usDot: string,
  client?: DbQueryable,
): Promise<CarrierRow | null> {
  const result = await query(
    `
      SELECT ${CARRIER_COLUMNS}
      FROM carriers_active
      WHERE us_dot = $1
      LIMIT 1
    `,
    [usDot],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(carrierRowSchema, row);
}

export async function findActiveByMc(
  mc: string,
  client?: DbQueryable,
): Promise<CarrierRow | null> {
  const result = await query(
    `
      SELECT ${CARRIER_COLUMNS}
      FROM carriers_active
      WHERE mc = $1
      LIMIT 1
    `,
    [mc],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(carrierRowSchema, row);
}

export async function listCarriers(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at" | "updated_at" | "legal_name" | "us_dot" | "mc";
  readonly dir: "asc" | "desc";
}): Promise<{ readonly items: readonly CarrierRow[]; readonly total: number }> {
  const sortColumn =
    input.sort === "legal_name"
      ? "legal_name"
      : input.sort === "us_dot"
        ? "us_dot"
        : input.sort === "mc"
          ? "mc"
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
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(legal_name ILIKE $${params.length} OR us_dot ILIKE $${params.length} OR mc ILIKE $${params.length} OR dba ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${CARRIER_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM carriers
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
    items: result.rows.map((row) => parseRow(carrierRowSchema, row)),
    total,
  };
}

export async function insertCarrier(
  input: {
    readonly usDot: string;
    readonly mc: string;
    readonly legalName: string;
    readonly dba: string;
    readonly businessAddress: string;
    readonly ownerOperatorDriver: string;
    readonly taxIdCiphertext: Buffer;
    readonly businessTelephone: string;
  },
  client?: DbQueryable,
): Promise<CarrierRow> {
  try {
    const result = await query(
      `
        INSERT INTO carriers (
          us_dot, mc, legal_name, dba, business_address, owner_operator_driver,
          tax_id_ciphertext, business_telephone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `,
      [
        input.usDot,
        input.mc,
        input.legalName,
        input.dba,
        input.businessAddress,
        input.ownerOperatorDriver,
        input.taxIdCiphertext,
        input.businessTelephone,
      ],
      client,
    );
    const id = (result.rows[0] as { id: string } | undefined)?.id;
    if (id === undefined) {
      throw new InternalError("insertCarrier returned no row");
    }
    const row = await getCarrierById(id, client);
    if (row === null) {
      throw new InternalError("insertCarrier could not reload row");
    }
    return row;
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Carrier us_dot or mc already exists");
    }
    throw err;
  }
}

export async function updateCarrier(
  input: {
    readonly id: string;
    readonly version: number;
    readonly usDot: string;
    readonly mc: string;
    readonly legalName: string;
    readonly dba: string;
    readonly businessAddress: string;
    readonly ownerOperatorDriver: string;
    readonly taxIdCiphertext?: Buffer;
    readonly businessTelephone: string;
  },
  client?: DbQueryable,
): Promise<CarrierRow | null> {
  try {
    const result = await query(
      `
        UPDATE carriers
        SET
          us_dot = $3,
          mc = $4,
          legal_name = $5,
          dba = $6,
          business_address = $7,
          owner_operator_driver = $8,
          business_telephone = $9,
          tax_id_ciphertext = COALESCE($10, tax_id_ciphertext),
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
        input.usDot,
        input.mc,
        input.legalName,
        input.dba,
        input.businessAddress,
        input.ownerOperatorDriver,
        input.businessTelephone,
        input.taxIdCiphertext ?? null,
      ],
      client,
    );
    const id = (result.rows[0] as { id: string } | undefined)?.id;
    if (id === undefined) {
      return null;
    }
    return getCarrierById(id, client);
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Carrier us_dot or mc already exists");
    }
    throw err;
  }
}

export async function archiveCarrier(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<CarrierRow | null> {
  const result = await query(
    `
      UPDATE carriers
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
  return getCarrierById(id, client);
}

export async function restoreCarrier(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<CarrierRow | null> {
  try {
    const result = await query(
      `
        UPDATE carriers
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
    return getCarrierById(id, client);
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Carrier us_dot or mc already exists");
    }
    throw err;
  }
}

export async function archiveActiveSalesByCarrierId(
  carrierId: string,
  client?: DbQueryable,
): Promise<void> {
  await query(
    `
      UPDATE sales
      SET
        archived_at = now(),
        version = version + 1,
        updated_at = now()
      WHERE carrier_id = $1
        AND archived_at IS NULL
    `,
    [carrierId],
    client,
  );
}
