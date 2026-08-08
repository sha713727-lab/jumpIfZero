"use client";

import { useDashboard } from "@/components/dashboard/DashboardProvider";
import type { InvoiceStatus } from "@/lib/data/customerPortalTypes";
import { dashboardEmptyCopy } from "@/lib/data/dashboard";
import { EmptyState } from "@/components/ui/EmptyState";

const statusClass: Record<InvoiceStatus, string> = {
  Due: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  Open: "bg-[rgba(92,104,73,0.14)] text-brand",
  Paid: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
};

export function InvoicesPage() {
  const { state } = useDashboard();
  const rows = state.invoices;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          Invoices
        </h1>
        <p className="mt-2 text-[0.95rem] font-medium text-black/50">
          Review billing and download invoice PDFs.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]">
        {rows.length === 0 ? (
          <EmptyState message={dashboardEmptyCopy.invoices} />
        ) : (
          <ul className="divide-y divide-black/8">
            {rows.map((invoice) => (
              <li
                key={invoice.id}
                className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:px-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.82rem] font-extrabold tracking-[0.08em] text-brand uppercase">
                      {invoice.number}
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
                  <a
                    href={`/api/invoices/${invoice.id}/pdf`}
                    className="rounded-xl border border-black/10 bg-white px-4 py-2 text-[0.82rem] font-bold text-brand transition-colors hover:bg-[#f3f5ef]"
                  >
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
