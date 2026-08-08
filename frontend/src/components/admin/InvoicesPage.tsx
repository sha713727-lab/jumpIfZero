"use client";

import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
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
  recipientKind: "client" | "outsider";
  clientId: string;
  clientQuery: string;
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

function matchesClientQuery(client: AdminClient, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return true;
  }
  return (
    client.company.toLowerCase().includes(q) ||
    client.name.toLowerCase().includes(q) ||
    client.email.toLowerCase().includes(q)
  );
}

const emptyForm: InvoiceForm = {
  recipientKind: "client",
  clientId: "",
  clientQuery: "",
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

export function InvoicesPage() {
  const { state, setInvoices } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const TrashIcon = adminIcons.trash;

  const openCreate = () => {
    setError(null);
    startTransition(async () => {
      const contact = await getAdminSiteContactAction();
      setForm({
        ...emptyForm,
        recipientKind: "client",
        clientId: "",
        clientQuery: "",
        number: nextInvoiceNumber(state.invoices.map((item) => item.number)),
        issuedOn: todayIso(),
        fromCompany: site.legalName,
        fromEmail: contact.ok ? contact.data.email : "",
        fromPhone: contact.ok ? contact.data.phone : "",
      });
      setModalOpen(true);
    });
  };

  const save = () => {
    const title = form.title.trim();
    const number = form.number.trim();
    const isOutsider = form.recipientKind === "outsider";
    const clientId = isOutsider ? null : form.clientId.trim() || null;
    if (!title || !number) {
      return;
    }
    if (!isOutsider && clientId === null) {
      setError("Select a registered client, or switch to Outsider.");
      return;
    }
    if (
      isOutsider &&
      form.billToCompany.trim().length === 0 &&
      form.billToName.trim().length === 0
    ) {
      setError("Outsider invoices need a Bill to company or name.");
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

    const existing = state.invoices.find((item) => item.id === deleteId);
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

  const deleteTarget = state.invoices.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Invoices"
        lede="Professional billing documents across all clients."
        actionLabel="Create invoice"
        onAction={openCreate}
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className={cardClass} aria-busy={pending}>
        {state.invoices.length === 0 ? (
          <EmptyState message="No invoices yet. Create one to get started." />
        ) : (
          <ul className="divide-y divide-black/8">
            {state.invoices.map((invoice) => {
              const client =
                invoice.clientId === null
                  ? undefined
                  : state.clients.find((c) => c.id === invoice.clientId);
              const recipient =
                invoice.billToCompany ||
                client?.company ||
                (invoice.clientId === null ? "Outsider" : "Client");

              return (
                <li
                  key={invoice.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[0.92rem] font-semibold text-[#0d120b]">
                      {invoice.title}
                    </p>
                    <p className="text-[0.82rem] font-medium text-black/45">
                      {recipient} · {invoice.number} · {invoice.amount}
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
              );
            })}
          </ul>
        )}
      </div>

      <AdminFormModal
        open={modalOpen}
        title="Create invoice"
        submitLabel="Create"
        wide
        onClose={() => {
          if (!pending) {
            setModalOpen(false);
          }
        }}
        onSubmit={save}
      >
        <div className="space-y-3">
          <span className={adminLabelClass}>Recipient</span>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className={`rounded-xl border px-3 py-2.5 text-left text-[0.88rem] font-semibold ${
                form.recipientKind === "client"
                  ? "border-brand bg-[rgba(92,104,73,0.12)] text-brand"
                  : "border-black/10 bg-white text-black/60"
              }`}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  recipientKind: "client",
                }))
              }
            >
              Registered client
            </button>
            <button
              type="button"
              className={`rounded-xl border px-3 py-2.5 text-left text-[0.88rem] font-semibold ${
                form.recipientKind === "outsider"
                  ? "border-brand bg-[rgba(92,104,73,0.12)] text-brand"
                  : "border-black/10 bg-white text-black/60"
              }`}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  recipientKind: "outsider",
                  clientId: "",
                  clientQuery: "",
                  billToCompany: "",
                  billToName: "",
                  billToEmail: "",
                  billToPhone: "",
                  billToLocation: "",
                }))
              }
            >
              Outsider (not a client)
            </button>
          </div>
          {form.recipientKind === "client" ? (
            <div>
              <label className="block">
                <span className={adminLabelClass}>Search clients</span>
                <input
                  className={adminFieldClass}
                  value={form.clientQuery}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      clientQuery: event.target.value,
                    }))
                  }
                  placeholder="Company, name, or email"
                />
              </label>
              <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-black/10 bg-white">
                {state.clients.filter((client) =>
                  matchesClientQuery(client, form.clientQuery),
                ).length === 0 ? (
                  <li className="px-3 py-2 text-[0.84rem] font-medium text-black/45">
                    No matching clients
                  </li>
                ) : (
                  state.clients
                    .filter((client) =>
                      matchesClientQuery(client, form.clientQuery),
                    )
                    .map((client) => {
                      const selected = form.clientId === client.id;
                      return (
                        <li key={client.id}>
                          <button
                            type="button"
                            className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left ${
                              selected
                                ? "bg-[rgba(92,104,73,0.14)]"
                                : "hover:bg-black/[0.03]"
                            }`}
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                clientId: client.id,
                                clientQuery: client.company,
                                ...billToFromClient(client),
                              }))
                            }
                          >
                            <span className="text-[0.88rem] font-semibold text-[#0d120b]">
                              {client.company || client.name}
                            </span>
                            <span className="text-[0.78rem] font-medium text-black/45">
                              {[client.name, client.email]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </button>
                        </li>
                      );
                    })
                )}
              </ul>
            </div>
          ) : (
            <p className="text-[0.82rem] font-medium text-black/45">
              Fill Bill to below. This invoice will not appear in any client
              portal.
            </p>
          )}
        </div>
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
              placeholder="Website development — Phase 1"
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
