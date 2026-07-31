"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminDemo } from "@/components/admin/AdminDemoProvider";
import type { AdminInvoice } from "@/constants/adminDemo";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

const invoiceStatusClass: Record<AdminInvoice["status"], string> = {
  draft: "bg-black/8 text-black/50",
  sent: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  paid: "bg-[rgba(116,129,95,0.16)] text-brand",
};

export function InvoicesPage() {
  const { state } = useAdminDemo();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Invoices"
        lede="Billing records across all clients."
      />

      <div className={cardClass}>
        <ul className="divide-y divide-black/8">
          {state.invoices.map((invoice) => {
            const client = state.clients.find((c) => c.id === invoice.clientId);

            return (
              <li key={invoice.id}>
                <Link
                  href={`/admin/clients/${invoice.clientId}/invoices`}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[0.92rem] font-semibold text-[#0d120b]">
                      {invoice.title}
                    </p>
                    <p className="text-[0.82rem] font-medium text-black/45">
                      {client?.company ?? "Client"} · {invoice.number} ·{" "}
                      {invoice.amount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold capitalize ${invoiceStatusClass[invoice.status]}`}
                    >
                      {invoice.status}
                    </span>
                    <span className="text-[0.8rem] font-medium text-black/35">
                      {invoice.updatedAt}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
