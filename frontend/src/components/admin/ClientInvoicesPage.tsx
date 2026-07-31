"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminTodayLabel, useAdminDemo } from "@/components/admin/AdminDemoProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { adminEmptyCopy } from "@/constants/admin";
import type { AdminInvoice } from "@/lib/data/admin";
import { EmptyState } from "@/components/ui/EmptyState";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type InvoiceForm = {
  number: string;
  title: string;
  amount: string;
  status: AdminInvoice["status"];
};

const emptyForm: InvoiceForm = {
  number: "",
  title: "",
  amount: "",
  status: "draft",
};

const invoiceStatusClass: Record<AdminInvoice["status"], string> = {
  draft: "bg-black/8 text-black/50",
  sent: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  paid: "bg-[rgba(116,129,95,0.16)] text-brand",
};

export function ClientInvoicesPage() {
  const params = useParams();
  const { state, setInvoices } = useAdminDemo();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<InvoiceForm>(emptyForm);

  const clientId = typeof params.id === "string" ? params.id : "";
  const invoices = state.invoices.filter((item) => item.clientId === clientId);

  const save = () => {
    const title = form.title.trim();
    const number = form.number.trim();
    if (!title || !number) {
      return;
    }

    const payload: AdminInvoice = {
      id: crypto.randomUUID(),
      clientId,
      number,
      title,
      amount: form.amount.trim() || "PKR 0",
      status: form.status,
      updatedAt: adminTodayLabel(),
    };

    setInvoices([...state.invoices, payload]);
    setModalOpen(false);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Invoices"
        lede="Billing records for this client."
        actionLabel="Create invoice"
        onAction={() => setModalOpen(true)}
      />

      <div className={cardClass}>
        {invoices.length === 0 ? (
          <EmptyState message={adminEmptyCopy.clientInvoices} />
        ) : (
          <ul className="divide-y divide-black/8">
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[0.92rem] font-semibold text-[#0d120b]">
                    {invoice.title}
                  </p>
                  <p className="text-[0.82rem] font-medium text-black/45">
                    {invoice.number} · {invoice.amount} · {invoice.updatedAt}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[0.72rem] font-bold capitalize ${invoiceStatusClass[invoice.status]}`}
                >
                  {invoice.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdminFormModal
        open={modalOpen}
        title="Create invoice"
        onClose={() => setModalOpen(false)}
        onSubmit={save}
        submitLabel="Create"
      >
        <div>
          <label className="block">
            <span className={adminLabelClass}>Invoice number</span>
            <input
            className={adminFieldClass}
            value={form.number}
            onChange={(event) =>
              setForm((current) => ({ ...current, number: event.target.value }))
            }
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Title</span>
            <input
            className={adminFieldClass}
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Amount</span>
            <input
            className={adminFieldClass}
            value={form.amount}
            onChange={(event) =>
              setForm((current) => ({ ...current, amount: event.target.value }))
            }
            placeholder="PKR 100,000"
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Status</span>
            <select
            className={adminFieldClass}
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as AdminInvoice["status"],
              }))
            }
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
          </select>
          </label>
        </div>
      </AdminFormModal>
    </div>
  );
}
