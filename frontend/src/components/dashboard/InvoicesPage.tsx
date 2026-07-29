"use client";

import { useState } from "react";
import { demoInvoices, type InvoiceStatus } from "@/constants/dashboard";

type InvoiceRow = {
  readonly id: string;
  readonly title: string;
  readonly amount: string;
  readonly issued: string;
  readonly due: string;
  status: InvoiceStatus;
};

const statusClass: Record<InvoiceStatus, string> = {
  Due: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  Open: "bg-[rgba(116,129,95,0.14)] text-brand",
  Paid: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
};

export function InvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>(
    demoInvoices.map((invoice) => ({ ...invoice })),
  );
  const [notice, setNotice] = useState<string | null>(null);

  const markPaid = (id: string) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id && row.status !== "Paid" ? { ...row, status: "Paid" } : row,
      ),
    );
    setNotice(`${id} marked as paid for this demo session.`);
  };

  const download = (id: string) => {
    setNotice(`${id} download started (demo).`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          Invoices
        </h1>
        <p className="mt-2 text-[0.95rem] font-medium text-black/50">
          Review billing, download PDFs, and pay open balances.
        </p>
      </div>

      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-brand/25 bg-[rgba(116,129,95,0.1)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
        >
          {notice}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]">
        <ul className="divide-y divide-black/8">
          {rows.map((invoice) => (
            <li
              key={invoice.id}
              className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:px-6"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[0.82rem] font-extrabold tracking-[0.08em] text-brand uppercase">
                    {invoice.id}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-extrabold tracking-[0.08em] uppercase ${statusClass[invoice.status]}`}
                  >
                    {invoice.status}
                  </span>
                </div>
                <p className="mt-1 text-[1rem] font-bold text-[#0d120b]">
                  {invoice.title}
                </p>
                <p className="mt-1 text-[0.8rem] font-medium text-black/40">
                  Issued {invoice.issued} · Due {invoice.due}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <p className="mr-2 text-[1.05rem] font-extrabold tracking-[-0.02em]">
                  {invoice.amount}
                </p>
                <button
                  type="button"
                  onClick={() => download(invoice.id)}
                  className="rounded-xl border border-black/12 px-3.5 py-2 text-[0.8rem] font-bold text-[#0d120b] transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  Download
                </button>
                {invoice.status !== "Paid" ? (
                  <button
                    type="button"
                    onClick={() => markPaid(invoice.id)}
                    className="rounded-xl bg-logo-gradient px-3.5 py-2 text-[0.8rem] font-extrabold text-[#0d120b] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    Pay
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
