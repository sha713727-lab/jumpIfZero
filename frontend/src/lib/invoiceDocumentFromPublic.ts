import type { InvoicePublic } from "@jumpifzero/contracts";
import type { InvoiceDocumentModel } from "@/components/invoices/InvoiceDocument";

export function invoiceDocumentFromPublic(
  invoice: InvoicePublic,
  opts?: {
    readonly footer?: {
      readonly phone: string;
      readonly email: string;
      readonly locationLines: readonly string[];
    };
  },
): InvoiceDocumentModel {
  const footer = opts?.footer;
  return {
    number: invoice.number,
    title: invoice.title,
    amount: invoice.amount,
    currency: invoice.currency,
    status: invoice.statusCode,
    issuedOn: invoice.issuedOn,
    dueDate: invoice.dueDate,
    createdAt: invoice.createdAt,
    company: {
      legalName: invoice.fromCompany,
      email: invoice.fromEmail,
      phone: invoice.fromPhone,
    },
    client: {
      company: invoice.billToCompany,
      name: invoice.billToName,
      email: invoice.billToEmail,
      phone: invoice.billToPhone,
      location: invoice.billToLocation,
    },
    footer: {
      phone: footer?.phone.trim() || invoice.fromPhone,
      email: footer?.email.trim() || invoice.fromEmail,
      locationLines: footer?.locationLines ?? [],
    },
  };
}
