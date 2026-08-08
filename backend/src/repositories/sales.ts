import { z } from "@jumpifzero/contracts";
import {
  saleRowSchema,
  type SaleRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";

export const saleSheetRowSchema = saleRowSchema.extend({
  us_dot: z.string().min(1).max(32),
  mc: z.string().min(1).max(32),
  legal_name: z.string().min(1).max(300),
  dba: z.string().max(300),
  business_address: z.string().max(500),
  owner_operator_driver: z.string().max(200),
  tax_id_ciphertext: z.union([
    z.instanceof(Buffer),
    z.instanceof(Uint8Array),
  ]).transform((v) => Buffer.from(v)),
  business_telephone: z.string().max(64),
  rep_user_name: z.string().max(200).nullish(),
  approver_user_name: z.string().max(200).nullish(),
  insurance_name: z.string().max(300).nullish(),
  insurance_phone: z.string().max(64).nullish(),
  insurance_street: z.string().max(300).nullish(),
  insurance_city_state_zip: z.string().max(200).nullish(),
  insurance_email: z.string().max(320).nullish(),
  factoring_name: z.string().max(300).nullish(),
  factoring_phone: z.string().max(64).nullish(),
  factoring_street: z.string().max(300).nullish(),
  factoring_city_state_zip: z.string().max(200).nullish(),
  factoring_email: z.string().max(320).nullish(),
});

export type SaleSheetRow = z.infer<typeof saleSheetRowSchema>;

const SALE_COLUMNS = `
  s.id, s.carrier_id, s.rep_id, s.status_code, s.amount, s.currency,
  s.truck_type, s.contact_name, s.contact_phone, s.contact_email,
  s.truck, s.trailer, s.insurance_party_id, s.factoring_party_id,
  s.approved_by_user_id, s.version, s.created_at, s.updated_at, s.archived_at
`;

const SALE_SHEET_JOIN = `
  c.us_dot, c.mc, c.legal_name, c.dba, c.business_address, c.owner_operator_driver,
  c.tax_id_ciphertext, c.business_telephone,
  rep_u.name AS rep_user_name,
  approver_u.name AS approver_user_name,
  ip.name AS insurance_name, ip.phone AS insurance_phone,
  ip.street AS insurance_street, ip.city_state_zip AS insurance_city_state_zip,
  ip.email AS insurance_email,
  fp.name AS factoring_name, fp.phone AS factoring_phone,
  fp.street AS factoring_street, fp.city_state_zip AS factoring_city_state_zip,
  fp.email AS factoring_email
`;

const SALE_SHEET_FROM = `
  FROM sales s
  INNER JOIN carriers c ON c.id = s.carrier_id
  INNER JOIN employees rep_e ON rep_e.id = s.rep_id
  INNER JOIN users rep_u ON rep_u.id = rep_e.user_id
  LEFT JOIN users approver_u ON approver_u.id = s.approved_by_user_id
  LEFT JOIN parties ip ON ip.id = s.insurance_party_id
  LEFT JOIN parties fp ON fp.id = s.factoring_party_id
`;

export async function getSaleById(
  id: string,
  client?: DbQueryable,
): Promise<SaleRow | null> {
  const result = await query(
    `
      SELECT ${SALE_COLUMNS}
      FROM sales s
      WHERE s.id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(saleRowSchema, row);
}

export async function getActiveSaleById(
  id: string,
  client?: DbQueryable,
): Promise<SaleRow | null> {
  const result = await query(
    `
      SELECT ${SALE_COLUMNS}
      FROM sales_active s
      WHERE s.id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(saleRowSchema, row);
}

export async function getSaleSheetById(
  id: string,
  client?: DbQueryable,
): Promise<SaleSheetRow | null> {
  const result = await query(
    `
      SELECT ${SALE_COLUMNS}, ${SALE_SHEET_JOIN}
      ${SALE_SHEET_FROM}
      WHERE s.id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(saleSheetRowSchema, row);
}

export async function getActiveSaleSheetById(
  id: string,
  client?: DbQueryable,
): Promise<SaleSheetRow | null> {
  const result = await query(
    `
      SELECT ${SALE_COLUMNS}, ${SALE_SHEET_JOIN}
      FROM sales_active s
      INNER JOIN carriers_active c ON c.id = s.carrier_id
      INNER JOIN employees_active rep_e ON rep_e.id = s.rep_id
      INNER JOIN users_active rep_u ON rep_u.id = rep_e.user_id
      LEFT JOIN users_active approver_u ON approver_u.id = s.approved_by_user_id
      LEFT JOIN parties_active ip ON ip.id = s.insurance_party_id
      LEFT JOIN parties_active fp ON fp.id = s.factoring_party_id
      WHERE s.id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(saleSheetRowSchema, row);
}

export async function listSaleSheets(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly status?: string;
  readonly repId?: string;
  readonly repIds: "all" | readonly string[];
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at" | "updated_at" | "status_code" | "amount";
  readonly dir: "asc" | "desc";
}): Promise<{ readonly items: readonly SaleSheetRow[]; readonly total: number }> {
  if (input.repIds !== "all" && input.repIds.length === 0) {
    return { items: [], total: 0 };
  }

  const sortColumn =
    input.sort === "status_code"
      ? "s.status_code"
      : input.sort === "amount"
        ? "s.amount"
        : input.sort === "updated_at"
          ? "s.updated_at"
          : "s.created_at";
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.archived === "active") {
    where.push("s.archived_at IS NULL");
  } else if (input.archived === "archived") {
    where.push("s.archived_at IS NOT NULL");
  }
  if (input.status !== undefined) {
    params.push(input.status);
    where.push(`s.status_code = $${params.length}`);
  }
  if (input.repId !== undefined) {
    params.push(input.repId);
    where.push(`s.rep_id = $${params.length}`);
  }
  if (input.repIds !== "all") {
    params.push([...input.repIds]);
    where.push(`s.rep_id = ANY($${params.length}::uuid[])`);
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(c.legal_name ILIKE $${params.length} OR c.us_dot ILIKE $${params.length} OR c.mc ILIKE $${params.length} OR rep_u.name ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${SALE_COLUMNS}, ${SALE_SHEET_JOIN}, COUNT(*) OVER()::int AS total_count
      ${SALE_SHEET_FROM}
      ${whereSql}
      ORDER BY ${sortColumn} ${dir}, s.id ASC
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
    items: result.rows.map((row) => parseRow(saleSheetRowSchema, row)),
    total,
  };
}

export async function insertSale(
  input: {
    readonly carrierId: string;
    readonly repId: string;
    readonly statusCode: string;
    readonly amount: string;
    readonly currency: string;
    readonly truckType: string;
    readonly contactName: string;
    readonly contactPhone: string;
    readonly contactEmail: string;
    readonly truck: string;
    readonly trailer: string;
    readonly insurancePartyId: string | null;
    readonly factoringPartyId: string | null;
    readonly approvedByUserId: string | null;
  },
  client?: DbQueryable,
): Promise<SaleRow> {
  const result = await query(
    `
      INSERT INTO sales (
        carrier_id, rep_id, status_code, amount, currency,
        truck_type, contact_name, contact_phone, contact_email,
        truck, trailer, insurance_party_id, factoring_party_id, approved_by_user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `,
    [
      input.carrierId,
      input.repId,
      input.statusCode,
      input.amount,
      input.currency,
      input.truckType,
      input.contactName,
      input.contactPhone,
      input.contactEmail,
      input.truck,
      input.trailer,
      input.insurancePartyId,
      input.factoringPartyId,
      input.approvedByUserId,
    ],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    throw new InternalError("insertSale returned no row");
  }
  const row = await getSaleById(id, client);
  if (row === null) {
    throw new InternalError("insertSale could not reload row");
  }
  return row;
}

export async function updateSale(
  input: {
    readonly id: string;
    readonly version: number;
    readonly carrierId: string;
    readonly statusCode: string;
    readonly amount: string;
    readonly currency: string;
    readonly truckType: string;
    readonly contactName: string;
    readonly contactPhone: string;
    readonly contactEmail: string;
    readonly truck: string;
    readonly trailer: string;
    readonly insurancePartyId: string | null;
    readonly factoringPartyId: string | null;
    readonly approvedByUserId: string | null;
  },
  client?: DbQueryable,
): Promise<SaleRow | null> {
  const result = await query(
    `
      UPDATE sales
      SET
        carrier_id = $3,
        status_code = $4,
        amount = $5,
        currency = $6,
        truck_type = $7,
        contact_name = $8,
        contact_phone = $9,
        contact_email = $10,
        truck = $11,
        trailer = $12,
        insurance_party_id = $13,
        factoring_party_id = $14,
        approved_by_user_id = $15,
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
      input.carrierId,
      input.statusCode,
      input.amount,
      input.currency,
      input.truckType,
      input.contactName,
      input.contactPhone,
      input.contactEmail,
      input.truck,
      input.trailer,
      input.insurancePartyId,
      input.factoringPartyId,
      input.approvedByUserId,
    ],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getSaleById(id, client);
}

export async function updateSaleStatus(
  input: {
    readonly id: string;
    readonly version: number;
    readonly statusCode: string;
  },
  client?: DbQueryable,
): Promise<SaleRow | null> {
  const result = await query(
    `
      UPDATE sales
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
  return getSaleById(id, client);
}

export async function archiveSale(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<SaleRow | null> {
  const result = await query(
    `
      UPDATE sales
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
  return getSaleById(id, client);
}

export async function restoreSale(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<SaleRow | null> {
  const result = await query(
    `
      UPDATE sales
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
  return getSaleById(id, client);
}
