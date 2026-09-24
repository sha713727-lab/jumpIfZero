import {
  invoiceLineItemRowSchema,
  invoiceRowSchema,
  type InvoiceLineItemRow,
  type InvoiceRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { ConflictError, InternalError } from "../lib/errors.ts";
import { isPgCode, parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

const INVOICE_COLUMNS = `
  id, client_id, number, title, amount::text AS amount, currency,
  status_code, due_date, issued_on,
  bill_to_company, bill_to_name, bill_to_email, bill_to_phone, bill_to_location,
  from_company, from_email, from_phone,
  version,
  created_at, updated_at, archived_at
`;

export async function getInvoiceById(
  id: string,
  client?: DbQueryable,
): Promise<InvoiceRow | null> {
  const result = await query(
    `
      SELECT ${INVOICE_COLUMNS}
      FROM invoices
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
  return parseRow(invoiceRowSchema, row);
}

export async function listInvoices(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly clientId?: string;
  readonly status?: "draft" | "sent" | "paid";
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at" | "updated_at" | "number" | "due_date";
  readonly dir: "asc" | "desc";
  readonly clientIds: "all" | readonly string[];
  readonly includeUnassigned: boolean;
}): Promise<{ readonly items: readonly InvoiceRow[]; readonly total: number }> {
  if (input.clientIds !== "all" && input.clientIds.length === 0 && !input.includeUnassigned) {
    return { items: [], total: 0 };
  }

  const sortColumn =
    input.sort === "number"
      ? "number"
      : input.sort === "due_date"
        ? "due_date"
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
    where.push(`(number ILIKE $${params.length} OR title ILIKE $${params.length})`);
  }
  if (input.clientIds !== "all") {
    if (input.clientIds.length === 0) {
      where.push("client_id IS NULL");
    } else {
      params.push([...input.clientIds]);
      if (input.includeUnassigned) {
        where.push(
          `(client_id = ANY($${params.length}::uuid[]) OR client_id IS NULL)`,
        );
      } else {
        where.push(`client_id = ANY($${params.length}::uuid[])`);
      }
    }
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${INVOICE_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM invoices
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
    items: result.rows.map((row) => parseRow(invoiceRowSchema, row)),
    total,
  };
}

export async function insertInvoice(
  input: {
    readonly clientId: string | null;
    readonly number: string;
    readonly title: string;
    readonly amount: string;
    readonly currency: string;
    readonly statusCode: "draft" | "sent" | "paid";
    readonly dueDate: string | null;
    readonly issuedOn: string | null;
    readonly billToCompany: string;
    readonly billToName: string;
    readonly billToEmail: string;
    readonly billToPhone: string;
    readonly billToLocation: string;
    readonly fromCompany: string;
    readonly fromEmail: string;
    readonly fromPhone: string;
  },
  client?: DbQueryable,
): Promise<InvoiceRow> {
  try {
    const result = await query(
      `
        INSERT INTO invoices (
          client_id, number, title, amount, currency,
          status_code, due_date, issued_on,
          bill_to_company, bill_to_name, bill_to_email, bill_to_phone, bill_to_location,
          from_company, from_email, from_phone
        )
        VALUES (
          $1, $2, $3, $4::numeric, $5,
          $6, $7::date, $8::date,
          $9, $10, $11, $12, $13,
          $14, $15, $16
        )
        RETURNING id
      `,
      [
        input.clientId,
        input.number,
        input.title,
        input.amount,
        input.currency,
        input.statusCode,
        input.dueDate,
        input.issuedOn,
        input.billToCompany,
        input.billToName,
        input.billToEmail,
        input.billToPhone,
        input.billToLocation,
        input.fromCompany,
        input.fromEmail,
        input.fromPhone,
      ],
      client,
    );
    const id = (result.rows[0] as { id: string } | undefined)?.id;
    if (id === undefined) {
      throw new InternalError("insertInvoice returned no row");
    }
    const row = await getInvoiceById(id, client);
    if (row === null) {
      throw new InternalError("insertInvoice could not reload row");
    }
    return row;
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Invoice number already exists");
    }
    throw err;
  }
}

export async function updateInvoice(
  input: {
    readonly id: string;
    readonly version: number;
    readonly title: string;
    readonly amount: string;
    readonly currency: string;
    readonly statusCode: "draft" | "sent" | "paid";
    readonly dueDate: string | null;
    readonly issuedOn: string | null;
    readonly billToCompany: string;
    readonly billToName: string;
    readonly billToEmail: string;
    readonly billToPhone: string;
    readonly billToLocation: string;
    readonly fromCompany: string;
    readonly fromEmail: string;
    readonly fromPhone: string;
  },
  client?: DbQueryable,
): Promise<InvoiceRow | null> {
  const result = await query(
    `
      UPDATE invoices
      SET
        title = $3,
        amount = $4::numeric,
        currency = $5,
        status_code = $6,
        due_date = $7::date,
        issued_on = $8::date,
        bill_to_company = $9,
        bill_to_name = $10,
        bill_to_email = $11,
        bill_to_phone = $12,
        bill_to_location = $13,
        from_company = $14,
        from_email = $15,
        from_phone = $16,
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
      input.amount,
      input.currency,
      input.statusCode,
      input.dueDate,
      input.issuedOn,
      input.billToCompany,
      input.billToName,
      input.billToEmail,
      input.billToPhone,
      input.billToLocation,
      input.fromCompany,
      input.fromEmail,
      input.fromPhone,
    ],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getInvoiceById(id, client);
}

export async function archiveInvoice(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<InvoiceRow | null> {
  const result = await query(
    `
      UPDATE invoices
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
  return getInvoiceById(id, client);
}

export async function archiveActiveByClientId(
  clientId: string,
  client?: DbQueryable,
): Promise<number> {
  const result = await query(
    `
      UPDATE invoices
      SET
        archived_at = now(),
        version = version + 1,
        updated_at = now()
      WHERE client_id = $1
        AND archived_at IS NULL
    `,
    [clientId],
    client,
  );
  return result.rowCount ?? 0;
}

export async function restoreInvoice(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<InvoiceRow | null> {
  const result = await query(
    `
      UPDATE invoices
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
  return getInvoiceById(id, client);
}

const LINE_ITEM_COLUMNS = `
  id, invoice_id, description, amount::text AS amount, sort_order,
  created_at, updated_at
`;

export async function listLineItemsByInvoiceId(
  invoiceId: string,
  client?: DbQueryable,
): Promise<readonly InvoiceLineItemRow[]> {
  const result = await query(
    `
      SELECT ${LINE_ITEM_COLUMNS}
      FROM invoice_line_items
      WHERE invoice_id = $1
      ORDER BY sort_order ASC, id ASC
    `,
    [invoiceId],
    client,
  );
  return result.rows.map((row) => parseRow(invoiceLineItemRowSchema, row));
}

export async function listLineItemsByInvoiceIds(
  invoiceIds: readonly string[],
  client?: DbQueryable,
): Promise<ReadonlyMap<string, readonly InvoiceLineItemRow[]>> {
  const map = new Map<string, InvoiceLineItemRow[]>();
  if (invoiceIds.length === 0) {
    return map;
  }
  const result = await query(
    `
      SELECT ${LINE_ITEM_COLUMNS}
      FROM invoice_line_items
      WHERE invoice_id = ANY($1::uuid[])
      ORDER BY sort_order ASC, id ASC
    `,
    [invoiceIds],
    client,
  );
  for (const raw of result.rows) {
    const row = parseRow(invoiceLineItemRowSchema, raw);
    const existing = map.get(row.invoice_id);
    if (existing === undefined) {
      map.set(row.invoice_id, [row]);
    } else {
      existing.push(row);
    }
  }
  return map;
}

export async function replaceLineItems(
  input: {
    readonly invoiceId: string;
    readonly lines: readonly {
      readonly description: string;
      readonly amount: string;
      readonly sortOrder: number;
    }[];
  },
  client: DbQueryable,
): Promise<readonly InvoiceLineItemRow[]> {
  await query(
    `DELETE FROM invoice_line_items WHERE invoice_id = $1`,
    [input.invoiceId],
    client,
  );

  for (const line of input.lines) {
    const id = await nextUuidv7(client);
    await query(
      `
        INSERT INTO invoice_line_items (
          id, invoice_id, description, amount, sort_order
        )
        VALUES ($1, $2, $3, $4::numeric, $5)
      `,
      [
        id,
        input.invoiceId,
        line.description,
        line.amount,
        line.sortOrder,
      ],
      client,
    );
  }

  return listLineItemsByInvoiceId(input.invoiceId, client);
}
