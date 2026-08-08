import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvoiceDocumentClient } from "@/components/invoices/InvoiceDocumentClient";
import { loadInvoiceDocument } from "@/lib/data/adminInvoiceDocument";
import { requireAdminActor } from "@/lib/data/adminSession";

export const metadata: Metadata = {
  title: "Invoice",
};

export default async function AdminInvoicePrintPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const { actor } = await requireAdminActor();
  const invoice = await loadInvoiceDocument(actor, id);

  if (!invoice) {
    notFound();
  }

  return (
    <InvoiceDocumentClient
      invoice={invoice}
      invoiceId={id}
      backHref="/admin/invoices"
    />
  );
}
