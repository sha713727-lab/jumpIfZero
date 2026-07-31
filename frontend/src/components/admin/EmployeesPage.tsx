"use client";

import Image from "next/image";
import { useState } from "react";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminTodayLabel, useAdminDemo } from "@/components/admin/AdminDemoProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import type { AdminEmployee, EmployeeKind } from "@/lib/data/admin";
import { employeeKindLabel } from "@/constants/sales";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type EmployeeForm = {
  name: string;
  email: string;
  role: string;
  department: string;
  kind: EmployeeKind;
  image: string;
  active: boolean;
};

const emptyForm: EmployeeForm = {
  name: "",
  email: "",
  role: "",
  department: "",
  kind: "delivery",
  image: "",
  active: true,
};

export function EmployeesPage() {
  const { state, setEmployees } = useAdminDemo();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);

  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: AdminEmployee) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      email: item.email,
      role: item.role,
      department: item.department,
      kind: item.kind,
      image: item.image,
      active: item.active,
    });
    setModalOpen(true);
  };

  const save = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email) {
      return;
    }

    const existing = editingId
      ? state.employees.find((item) => item.id === editingId)
      : null;

    const payload: AdminEmployee = {
      id: editingId ?? crypto.randomUUID(),
      name,
      email,
      role: form.role.trim(),
      department: form.department.trim(),
      kind: form.kind,
      image: form.image,
      active: form.active,
      teamMemberId: existing?.teamMemberId ?? null,
      updatedAt: adminTodayLabel(),
    };

    if (editingId) {
      setEmployees(
        state.employees.map((item) => (item.id === editingId ? payload : item)),
      );
    } else {
      setEmployees([...state.employees, payload]);
    }

    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }
    setEmployees(state.employees.filter((item) => item.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const deleteTarget = state.employees.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Employees"
        lede="Internal staff directory for client assignments."
        actionLabel="Add employee"
        onAction={openAdd}
      />

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left">
            <thead>
              <tr className="border-b border-black/8 bg-[#f3f5ef]/60">
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Department
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Kind
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8">
              {state.employees.map((item) => (
                <tr key={item.id} className="hover:bg-[#f3f5ef]/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-black/8">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : null}
                      <span className="text-[0.9rem] font-semibold text-[#0d120b]">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[0.84rem] font-medium text-black/50">
                    {item.email}
                  </td>
                  <td className="px-4 py-3 text-[0.84rem] font-medium text-black/50">
                    {item.role}
                  </td>
                  <td className="px-4 py-3 text-[0.84rem] font-medium text-black/50">
                    {item.department}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                        item.kind === "sales"
                          ? "bg-[rgba(249,161,55,0.18)] text-[#e8891a]"
                          : "bg-[rgba(116,129,95,0.12)] text-brand"
                      }`}
                    >
                      {employeeKindLabel[item.kind]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                        item.active
                          ? "bg-[rgba(116,129,95,0.16)] text-brand"
                          : "bg-black/8 text-black/45"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </span>
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
      </div>

      <AdminFormModal
        open={modalOpen}
        title={editingId ? "Edit employee" : "Add employee"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
      >
        <div>
          <label className={adminLabelClass}>Name</label>
          <input
            className={adminFieldClass}
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Email</label>
          <input
            type="email"
            className={adminFieldClass}
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Role</label>
          <input
            className={adminFieldClass}
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({ ...current, role: event.target.value }))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Department</label>
          <input
            className={adminFieldClass}
            value={form.department}
            onChange={(event) =>
              setForm((current) => ({ ...current, department: event.target.value }))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Kind</label>
          <select
            className={adminFieldClass}
            value={form.kind}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                kind: event.target.value as EmployeeKind,
              }))
            }
          >
            <option value="delivery">{employeeKindLabel.delivery}</option>
            <option value="sales">{employeeKindLabel.sales}</option>
          </select>
        </div>
        <AdminImageField
          label="Image"
          value={form.image}
          onChange={(image) => setForm((current) => ({ ...current, image }))}
        />
        <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setForm((current) => ({ ...current, active: event.target.checked }))
            }
          />
          Active
        </label>
      </AdminFormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete employee"
        lede={`Remove "${deleteTarget?.name ?? "this employee"}" from the directory?`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
