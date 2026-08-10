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

const actionButtonClass =
  "rounded-xl border border-black/80 bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream shadow-[0_4px_12px_rgba(13,18,11,0.18)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

export function InvoiceDocumentClient({
  invoice,
  invoiceId,
  backHref,
}: InvoiceDocumentClientProps) {
  return (
    <div className="min-h-screen bg-white px-4 py-8 md:px-8 md:py-12 print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex w-full max-w-[800px] flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={backHref}
          className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-[0.88rem] font-semibold text-[#0d120b]"
        >
          ← Back
        </Link>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            className={actionButtonClass}
            onClick={() => {
              window.print();
            }}
          >
            Print invoice
          </button>
          <a
            href={`/api/invoices/${invoiceId}/pdf`}
            className={actionButtonClass}
          >
            Download PDF
          </a>
        </div>
      </div>
      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
