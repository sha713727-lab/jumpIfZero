import {
  invoiceArchiveSchema,
  invoiceCreateSchema,
  invoicePublicSchema,
  invoiceRestoreSchema,
  invoicesListQuerySchema,
  invoicesListResponseSchema,
  invoiceUpdateSchema,
  type Actor,
  type InvoicePublic,
  type InvoiceRow,
} from "@jumpifzero/contracts";
import { withTransaction } from "../db/transaction.ts";
import { BadRequestError, NotFoundError } from "../lib/errors.ts";
import * as clientsRepo from "../repositories/clients.ts";
import * as idempotencyRepo from "../repositories/idempotency-keys.ts";
import * as invoicesRepo from "../repositories/invoices.ts";
import {
  accessibleClientIds,
  assertCanAccessClient,
  requireDeliveryOrAdmin,
} from "./access.ts";
import { parseInput, resolveVersionWrite } from "./_helpers.ts";
import { env } from "../config/env.ts";
import { logger } from "../lib/logger.ts";
import { sendInvoiceEmail } from "../lib/mail.ts";

function dateOnly(value: Date | null): string | null {
  if (value === null) {
    return null;
  }
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toPublic(row: InvoiceRow): InvoicePublic {
  return invoicePublicSchema.parse({
    id: row.id,
    clientId: row.client_id,
    number: row.number,
    title: row.title,
    amount: row.amount,
    currency: row.currency.trim(),
    statusCode: row.status_code,
    dueDate: dateOnly(row.due_date),
    issuedOn: dateOnly(row.issued_on),
    billToCompany: row.bill_to_company,
    billToName: row.bill_to_name,
    billToEmail: row.bill_to_email,
    billToPhone: row.bill_to_phone,
    billToLocation: row.bill_to_location,
    fromCompany: row.from_company,
    fromEmail: row.from_email,
    fromPhone: row.from_phone,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt:
      row.archived_at === null ? null : row.archived_at.toISOString(),
  });
}

async function assertCanAccessInvoice(
  actor: Actor,
  clientId: string | null,
): Promise<void> {
  if (clientId === null) {
    await requireDeliveryOrAdmin(actor);
    return;
  }
  await assertCanAccessClient(actor, clientId);
}

async function queueInvoiceEmail(input: {
  readonly invoice: InvoicePublic;
  readonly recipient: string | undefined;
  readonly clientName: string;
}): Promise<void> {
  if (input.invoice.statusCode !== "sent") {
    return;
  }
  const to = input.recipient?.trim() ?? "";
  if (to.length === 0) {
    logger.warn({
      msg: "invoice_mail_skipped_no_recipient",
      route: "mail.invoice",
    });
    return;
  }

  try {
    await sendInvoiceEmail({
      to,
      clientName: input.clientName,
      invoiceNumber: input.invoice.number,
      title: input.invoice.title,
      amount: input.invoice.amount,
      currency: input.invoice.currency,
      issuedOn: input.invoice.issuedOn,
      dueDate: input.invoice.dueDate,
      viewUrl: `${env.CORS_ORIGIN}/dashboard/invoices`,
    });
  } catch (err) {
    logger.error({
      msg: "invoice_mail_failed",
      route: "mail.invoice",
      err,
    });
  }
}

export async function listInvoices(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  const query = parseInput(invoicesListQuerySchema, input);
  const clientIds = await accessibleClientIds(actor);
  if (query.clientId !== undefined) {
    await assertCanAccessClient(actor, query.clientId);
  }
  const result = await invoicesRepo.listInvoices({
    limit: query.limit,
    offset: query.offset,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.clientId !== undefined ? { clientId: query.clientId } : {}),
    ...(query.status !== undefined ? { status: query.status } : {}),
    archived: query.archived,
    sort: query.sort,
    dir: query.dir,
    clientIds,
    includeUnassigned:
      actor.role === "admin" ||
      (actor.role === "employee" && actor.employeeKind === "delivery"),
  });
  return invoicesListResponseSchema.parse({
    items: result.items.map(toPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getInvoice(
  actor: Actor,
  id: string,
): Promise<InvoicePublic> {
  const row = await invoicesRepo.getInvoiceById(id);
  if (row === null || (actor.role !== "admin" && row.archived_at !== null)) {
    throw new NotFoundError("Invoice not found");
  }
  await assertCanAccessInvoice(actor, row.client_id);
  return toPublic(row);
}

export async function createInvoice(
  actor: Actor,
  input: unknown,
  opts: {
    readonly idempotencyKey: string | null;
    readonly method: string;
    readonly path: string;
  },
): Promise<{ readonly replay: boolean; readonly status: number; readonly body: InvoicePublic }> {
  await requireDeliveryOrAdmin(actor);
  if (opts.idempotencyKey === null || opts.idempotencyKey.trim().length === 0) {
    throw new BadRequestError("Idempotency-Key required");
  }
  const key = opts.idempotencyKey.trim();
  if (key.length > 128) {
    throw new BadRequestError("Idempotency-Key too long");
  }

  const body = parseInput(invoiceCreateSchema, input);
  await assertCanAccessInvoice(actor, body.clientId);

  const existing = await idempotencyRepo.findActiveIdempotencyKey({
    key,
    method: opts.method,
    path: opts.path,
    subjectId: actor.subjectId,
  });
  if (existing !== null) {
    return {
      replay: true,
      status: existing.response_status,
      body: invoicePublicSchema.parse(existing.response_body),
    };
  }

  return withTransaction(async (tx) => {
    const raced = await idempotencyRepo.findActiveIdempotencyKey(
      {
        key,
        method: opts.method,
        path: opts.path,
        subjectId: actor.subjectId,
      },
      tx,
    );
    if (raced !== null) {
      return {
        replay: true,
        status: raced.response_status,
        body: invoicePublicSchema.parse(raced.response_body),
        clientName: "",
        recipient: undefined as string | undefined,
      };
    }

    let clientName = body.billToName.trim() || body.billToCompany.trim() || "Recipient";
    let recipient: string | undefined =
      body.billToEmail.trim().length > 0 ? body.billToEmail.trim() : undefined;

    if (body.clientId !== null) {
      const client = await clientsRepo.getActiveClientById(body.clientId, tx);
      if (client === null) {
        throw new NotFoundError("Client not found");
      }
      if (body.billToName.trim().length === 0) {
        clientName = client.user_name ?? client.company;
      }
      if (recipient === undefined) {
        recipient = client.user_email ?? undefined;
      }
    }

    const row = await invoicesRepo.insertInvoice(
      {
        clientId: body.clientId,
        number: body.number,
        title: body.title,
        amount: body.amount,
        currency: body.currency,
        statusCode: body.statusCode,
        dueDate: body.dueDate,
        issuedOn: body.issuedOn,
        billToCompany: body.billToCompany,
        billToName: body.billToName,
        billToEmail: body.billToEmail,
        billToPhone: body.billToPhone,
        billToLocation: body.billToLocation,
        fromCompany: body.fromCompany,
        fromEmail: body.fromEmail,
        fromPhone: body.fromPhone,
      },
      tx,
    );
    const publicBody = toPublic(row);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const stored = await idempotencyRepo.insertIdempotencyKey(
      {
        key,
        method: opts.method,
        path: opts.path,
        subjectId: actor.subjectId,
        responseStatus: 201,
        responseBody: publicBody,
        expiresAt,
      },
      tx,
    );
    if (stored === null) {
      const again = await idempotencyRepo.findActiveIdempotencyKey(
        {
          key,
          method: opts.method,
          path: opts.path,
          subjectId: actor.subjectId,
        },
        tx,
      );
      if (again !== null) {
        return {
          replay: true,
          status: again.response_status,
          body: invoicePublicSchema.parse(again.response_body),
          clientName: "",
          recipient: undefined as string | undefined,
        };
      }
    }
    return {
      replay: false,
      status: 201,
      body: publicBody,
      clientName,
      recipient,
    };
  }).then(async (result) => {
    if (!result.replay) {
      await queueInvoiceEmail({
        invoice: result.body,
        recipient: result.recipient,
        clientName: result.clientName,
      });
    }
    return {
      replay: result.replay,
      status: result.status,
      body: result.body,
    };
  });
}

export async function updateInvoice(
  actor: Actor,
  input: unknown,
): Promise<InvoicePublic> {
  await requireDeliveryOrAdmin(actor);
  const body = parseInput(invoiceUpdateSchema, input);
  const existing = await invoicesRepo.getInvoiceById(body.id);
  if (existing === null || existing.archived_at !== null) {
    throw new NotFoundError("Invoice not found");
  }
  await assertCanAccessInvoice(actor, existing.client_id);
  const updated = await invoicesRepo.updateInvoice({
    id: body.id,
    version: body.version,
    title: body.title,
    amount: body.amount,
    currency: body.currency,
    statusCode: body.statusCode,
    dueDate: body.dueDate,
    issuedOn: body.issuedOn,
    billToCompany: body.billToCompany,
    billToName: body.billToName,
    billToEmail: body.billToEmail,
    billToPhone: body.billToPhone,
    billToLocation: body.billToLocation,
    fromCompany: body.fromCompany,
    fromEmail: body.fromEmail,
    fromPhone: body.fromPhone,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => invoicesRepo.getInvoiceById(body.id),
    notFoundMessage: "Invoice not found",
    conflictMessage: "Invoice version conflict",
  });
  const publicBody = toPublic(row);
  if (existing.status_code !== "sent" && publicBody.statusCode === "sent") {
    const client =
      row.client_id === null
        ? null
        : await clientsRepo.getActiveClientById(row.client_id);
    const billTo = publicBody.billToEmail.trim();
    await queueInvoiceEmail({
      invoice: publicBody,
      recipient: billTo.length > 0 ? billTo : client?.user_email,
      clientName:
        publicBody.billToName.trim() ||
        publicBody.billToCompany.trim() ||
        client?.user_name ||
        client?.company ||
        "Client",
    });
  }
  return publicBody;
}

export async function archiveInvoice(
  actor: Actor,
  input: unknown,
): Promise<InvoicePublic> {
  await requireDeliveryOrAdmin(actor);
  const body = parseInput(invoiceArchiveSchema, input);
  const existing = await invoicesRepo.getInvoiceById(body.id);
  if (existing === null) {
    throw new NotFoundError("Invoice not found");
  }
  await assertCanAccessInvoice(actor, existing.client_id);
  const archived = await invoicesRepo.archiveInvoice({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: archived,
    lookup: () => invoicesRepo.getInvoiceById(body.id),
    notFoundMessage: "Invoice not found",
    conflictMessage: "Invoice version conflict",
  });
  return toPublic(row);
}

export async function restoreInvoice(
  actor: Actor,
  input: unknown,
): Promise<InvoicePublic> {
  await requireDeliveryOrAdmin(actor);
  const body = parseInput(invoiceRestoreSchema, input);
  const existing = await invoicesRepo.getInvoiceById(body.id);
  if (existing === null) {
    throw new NotFoundError("Invoice not found");
  }
  await assertCanAccessInvoice(actor, existing.client_id);
  const restored = await invoicesRepo.restoreInvoice({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => invoicesRepo.getInvoiceById(body.id),
    notFoundMessage: "Invoice not found",
    conflictMessage: "Invoice version conflict",
  });
  return toPublic(row);
}
