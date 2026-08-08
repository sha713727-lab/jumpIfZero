"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import { adminEmptyCopy } from "@/constants/admin";
import { site } from "@/constants/site";
import type { AdminClient, AdminInvoice } from "@/lib/data/admin";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  archiveInvoiceAction,
  createInvoiceAction,
} from "@/lib/submitOps";
import { getAdminSiteContactAction } from "@/lib/submitAdminSiteContact";
import { nextInvoiceNumber } from "@/lib/invoiceNumber";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type InvoiceForm = {
  number: string;
  title: string;
  amount: string;
  currency: string;
  status: AdminInvoice["status"];
  issuedOn: string;
  dueDate: string;
  billToCompany: string;
  billToName: string;
  billToEmail: string;
  billToPhone: string;
  billToLocation: string;
  fromCompany: string;
  fromEmail: string;
  fromPhone: string;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function billToFromClient(client: AdminClient | undefined) {
  return {
    billToCompany: client?.company ?? "",
    billToName: client?.name ?? "",
    billToEmail: client?.email ?? "",
    billToPhone: client?.phone ?? "",
    billToLocation: client?.location ?? "",
  };
}

const emptyForm: InvoiceForm = {
  number: "",
  title: "",
  amount: "",
  currency: "USD",
  status: "draft",
  issuedOn: "",
  dueDate: "",
  billToCompany: "",
  billToName: "",
  billToEmail: "",
  billToPhone: "",
  billToLocation: "",
  fromCompany: site.legalName,
  fromEmail: "",
  fromPhone: "",
};

const invoiceStatusClass: Record<AdminInvoice["status"], string> = {
  draft: "bg-black/8 text-black/50",
  sent: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  paid: "bg-[rgba(92,104,73,0.16)] text-brand",
};

const invoiceStatusLabel: Record<AdminInvoice["status"], string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
};

export function ClientInvoicesPage() {
  const params = useParams();
  const { state, setInvoices } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const TrashIcon = adminIcons.trash;

  const clientId = typeof params.id === "string" ? params.id : "";
  const invoices = state.invoices.filter((item) => item.clientId === clientId);

  const save = () => {
    const title = form.title.trim();
    const number = form.number.trim();
    if (!title || !number || !clientId) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await createInvoiceAction({
        clientId,
        number,
        title,
        amount: form.amount.trim() || "0",
        currency: form.currency.trim() || "USD",
        statusCode: form.status,
        issuedOn: form.issuedOn.trim() || null,
        dueDate: form.dueDate.trim() || null,
        billToCompany: form.billToCompany,
        billToName: form.billToName,
        billToEmail: form.billToEmail,
        billToPhone: form.billToPhone,
        billToLocation: form.billToLocation,
        fromCompany: form.fromCompany,
        fromEmail: form.fromEmail,
        fromPhone: form.fromPhone,
      });

      if (!result.ok || !("data" in result)) {
        setError(
          result.ok
            ? "Create failed."
            : result.reason === "conflict"
              ? "Invoice number already exists. Use a different number."
              : "Could not create invoice.",
        );
        return;
      }

      setInvoices([...state.invoices, result.data]);
      setModalOpen(false);
      setForm(emptyForm);
    });
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    const existing = invoices.find((item) => item.id === deleteId);
    if (!existing) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await archiveInvoiceAction({
        id: existing.id,
        version: existing.version,
      });

      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "This invoice was updated elsewhere. Refresh and try again."
            : "Could not delete invoice.",
        );
        return;
      }

      setInvoices(state.invoices.filter((item) => item.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    });
  };

  const deleteTarget = invoices.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Invoices"
        lede="Professional billing documents for this client."
        actionLabel="Create invoice"
        onAction={() => {
          setError(null);
          startTransition(async () => {
            const client = state.clients.find((item) => item.id === clientId);
            const contact = await getAdminSiteContactAction();
            setForm({
              ...emptyForm,
              number: nextInvoiceNumber(
                state.invoices.map((item) => item.number),
              ),
              issuedOn: todayIso(),
              ...billToFromClient(client),
              fromCompany: site.legalName,
              fromEmail: contact.ok ? contact.data.email : "",
              fromPhone: contact.ok ? contact.data.phone : "",
            });
            setModalOpen(true);
          });
        }}
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className={cardClass} aria-busy={pending}>
        {invoices.length === 0 ? (
          <EmptyState message={adminEmptyCopy.clientInvoices} />
        ) : (
          <ul className="divide-y divide-black/8">
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-[0.92rem] font-semibold text-[#0d120b]">
                    {invoice.title}
                  </p>
                  <p className="text-[0.82rem] font-medium text-black/45">
                    {invoice.number} · {invoice.amount} · {invoice.updatedAt}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${invoiceStatusClass[invoice.status]}`}
                  >
                    {invoiceStatusLabel[invoice.status]}
                  </span>
                  <a
                    href={`/admin/invoices/${invoice.id}/print`}
                    className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-brand"
                  >
                    View
                  </a>
                  <a
                    href={`/api/invoices/${invoice.id}/pdf`}
                    className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-brand"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    aria-label="Delete"
                    disabled={pending}
                    onClick={() => {
                      setDeleteId(invoice.id);
                      setDeleteOpen(true);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdminFormModal
        open={modalOpen}
        title="Create invoice"
        wide
        onClose={() => {
          if (!pending) {
            setModalOpen(false);
          }
        }}
        onSubmit={save}
        submitLabel="Create"
      >
        <div>
          <span className={adminLabelClass}>Invoice number</span>
          <p
            className={`${adminFieldClass} bg-[#f3f5ef]/70 text-black/55`}
            aria-live="polite"
          >
            {form.number}
          </p>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Title / description</span>
            <input
              className={adminFieldClass}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={adminLabelClass}>Amount</span>
            <input
              className={adminFieldClass}
              value={form.amount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  amount: event.target.value,
                }))
              }
              placeholder="1000.00"
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Currency</span>
            <select
              className={adminFieldClass}
              value={form.currency}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  currency: event.target.value,
                }))
              }
            >
              <option value="USD">USD</option>
              <option value="PKR">PKR</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={adminLabelClass}>Issued on</span>
            <input
              type="date"
              className={adminFieldClass}
              value={form.issuedOn}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  issuedOn: event.target.value,
                }))
              }
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Due date</span>
            <input
              type="date"
              className={adminFieldClass}
              value={form.dueDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <div className="space-y-3">
          <p className={adminLabelClass}>Bill to</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={adminLabelClass}>Company</span>
              <input
                className={adminFieldClass}
                value={form.billToCompany}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    billToCompany: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Contact name</span>
              <input
                className={adminFieldClass}
                value={form.billToName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    billToName: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Email</span>
              <input
                className={adminFieldClass}
                value={form.billToEmail}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    billToEmail: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Phone</span>
              <input
                className={adminFieldClass}
                value={form.billToPhone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    billToPhone: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label className="block">
            <span className={adminLabelClass}>Location</span>
            <input
              className={adminFieldClass}
              value={form.billToLocation}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  billToLocation: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <div className="space-y-3">
          <p className={adminLabelClass}>From</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={adminLabelClass}>Company</span>
              <input
                className={adminFieldClass}
                value={form.fromCompany}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fromCompany: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Email</span>
              <input
                className={adminFieldClass}
                value={form.fromEmail}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fromEmail: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Phone</span>
              <input
                className={adminFieldClass}
                value={form.fromPhone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fromPhone: event.target.value,
                  }))
                }
              />
            </label>
          </div>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Category / status</span>
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

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete invoice"
        lede={`Remove "${deleteTarget?.title ?? "this invoice"}" from billing records?`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
