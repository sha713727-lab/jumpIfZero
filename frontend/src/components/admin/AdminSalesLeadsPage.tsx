"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminTodayLabel, useAdminDemo } from "@/components/admin/AdminDemoProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import { adminEmptyCopy } from "@/constants/admin";
import { leadStatuses, leadStatusLabel } from "@/constants/sales";
import type { AdminLead, LeadStatus } from "@/lib/data/admin";
import { EmptyState } from "@/components/ui/EmptyState";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

const statusPillClass: Record<LeadStatus, string> = {
  new: "bg-[rgba(116,129,95,0.12)] text-brand",
  contacted: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  qualified: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
  converted: "bg-[rgba(116,129,95,0.16)] text-brand",
  closed: "bg-black/8 text-black/50",
};

type LeadForm = {
  repId: string;
  company: string;
  contactName: string;
  phone: string;
  email: string;
  source: string;
  status: LeadStatus;
  notes: string;
};

const emptyForm: LeadForm = {
  repId: "",
  company: "",
  contactName: "",
  phone: "",
  email: "",
  source: "",
  status: "new",
  notes: "",
};

export function AdminSalesLeadsPage() {
  const { state, setLeads } = useAdminDemo();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<LeadForm>(emptyForm);

  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;

  const salesEmployees = state.employees.filter(
    (item) => item.kind === "sales" && item.active,
  );

  const repName = (repId: string) =>
    state.employees.find((item) => item.id === repId)?.name ?? "Unknown";

  const followUpCount = (leadId: string) =>
    state.leadFollowUps.filter((item) => item.leadId === leadId).length;

  const openEdit = (item: AdminLead) => {
    setEditingId(item.id);
    setForm({
      repId: item.repId,
      company: item.company,
      contactName: item.contactName,
      phone: item.phone,
      email: item.email,
      source: item.source,
      status: item.status,
      notes: item.notes,
    });
    setModalOpen(true);
  };

  const save = () => {
    const company = form.company.trim();
    if (!company || !form.repId) {
      return;
    }

    const payload: AdminLead = {
      id: editingId ?? crypto.randomUUID(),
      repId: form.repId,
      company,
      contactName: form.contactName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      source: form.source.trim(),
      status: form.status,
      notes: form.notes.trim(),
      updatedAt: adminTodayLabel(),
    };

    if (editingId) {
      setLeads(
        state.leads.map((item) => (item.id === editingId ? payload : item)),
      );
    } else {
      setLeads([...state.leads, payload]);
    }

    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    setLeads(state.leads.filter((item) => item.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const deleteTarget = state.leads.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sales leads"
        lede="All leads and follow-up activity across the team."
      />

      <div className={cardClass}>
        {state.leads.length === 0 ? (
          <EmptyState message={adminEmptyCopy.leads} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left">
              <thead>
                <tr className="border-b border-black/8 bg-[#f3f5ef]/60">
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    Company
                  </th>
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    Rep
                  </th>
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    Follow-ups
                  </th>
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8">
                {state.leads.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f3f5ef]/40">
                    <td className="px-4 py-3">
                      <p className="text-[0.9rem] font-semibold text-[#0d120b]">
                        {item.company}
                      </p>
                      <p className="text-[0.82rem] font-medium text-black/45">
                        {item.contactName} · {item.source}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[0.84rem] font-medium text-black/50">
                      {repName(item.repId)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${statusPillClass[item.status]}`}
                      >
                        {leadStatusLabel[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[0.84rem] font-medium text-black/50">
                      {followUpCount(item.id)}
                    </td>
                    <td className="px-4 py-3 text-[0.84rem] font-medium text-black/50">
                      {item.updatedAt}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => openEdit(item)}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
                        >
                          <EditIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={() => {
                            setDeleteId(item.id);
                            setDeleteOpen(true);
                          }}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminFormModal
        open={modalOpen}
        title={editingId ? "Edit lead" : "Add lead"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
      >
        <div>
          <label className="block">
            <span className={adminLabelClass}>Rep</span>
            <select
            className={adminFieldClass}
            value={form.repId}
            onChange={(event) =>
              setForm((current) => ({ ...current, repId: event.target.value }))
            }
          >
            <option value="">Select rep</option>
            {salesEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Company</span>
            <input
            className={adminFieldClass}
            value={form.company}
            onChange={(event) =>
              setForm((current) => ({ ...current, company: event.target.value }))
            }
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Contact name</span>
            <input
            className={adminFieldClass}
            value={form.contactName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                contactName: event.target.value,
              }))
            }
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Phone</span>
            <input
            className={adminFieldClass}
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Email</span>
            <input
            type="email"
            className={adminFieldClass}
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Source</span>
            <input
            className={adminFieldClass}
            value={form.source}
            onChange={(event) =>
              setForm((current) => ({ ...current, source: event.target.value }))
            }
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
                status: event.target.value as LeadStatus,
              }))
            }
          >
            {leadStatuses.map((status) => (
              <option key={status} value={status}>
                {leadStatusLabel[status]}
              </option>
            ))}
          </select>
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Notes</span>
            <textarea
            className={`${adminFieldClass} min-h-[5rem] resize-y`}
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
          />
          </label>
        </div>
      </AdminFormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete lead"
        lede={`Remove "${deleteTarget?.company ?? "this lead"}"?`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
