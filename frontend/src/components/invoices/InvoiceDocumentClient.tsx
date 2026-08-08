"use client";

import Link from "next/link";
import {
  InvoiceDocument,
  type InvoiceDocumentModel,
} from "@/components/invoices/InvoiceDocument";

type InvoiceDocumentClientProps = {
  readonly invoice: InvoiceDocumentModel;
  readonly invoiceId: string;
  readonly backHref: string;
};

export function InvoiceDocumentClient({
  invoice,
  invoiceId,
  backHref,
}: InvoiceDocumentClientProps) {
  return (
    <div className="min-h-screen bg-white px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto mb-6 flex w-full max-w-[800px] flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={backHref}
          className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-[0.88rem] font-semibold text-[#0d120b]"
        >
          ← Back
        </Link>
        <a
          href={`/api/invoices/${invoiceId}/pdf`}
          className="rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream"
        >
          Download PDF
        </a>
      </div>
      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
