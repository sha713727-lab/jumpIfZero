"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import type { AdminEmployee, EmployeeKind } from "@/lib/data/admin";
import { employeeKindLabel } from "@/constants/sales";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import {
  archiveAdminEmployeeAction,
  createAdminEmployeeAction,
  setAdminEmployeePasswordAction,
  updateAdminEmployeeAction,
} from "@/lib/submitAdminEmployees";

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
  password: string;
  confirmPassword: string;
};

const emptyForm: EmployeeForm = {
  name: "",
  email: "",
  role: "",
  department: "",
  kind: "delivery",
  image: "",
  active: true,
  password: "",
  confirmPassword: "",
};

export function EmployeesPage() {
  const { state, setEmployees } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [passwordEmployeeId, setPasswordEmployeeId] = useState<string | null>(
    null,
  );
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [pending, startTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;
  const KeyIcon = adminIcons.key;
  const EyeIcon = adminIcons.eye;
  const EyeOffIcon = adminIcons.eyeOff;

  const passwordTarget = state.employees.find(
    (item) => item.id === passwordEmployeeId,
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowCreatePassword(false);
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
      password: "",
      confirmPassword: "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openPassword = (item: AdminEmployee) => {
    setPasswordEmployeeId(item.id);
    setPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setShowSetPassword(false);
    setPasswordOpen(true);
  };

  const save = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email) {
      setFormError("Name and email are required.");
      return;
    }

    if (!editingId) {
      if (form.password.length < 8 || form.password.length > 200) {
        setFormError("Password must be 8–200 characters.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }

      startTransition(async () => {
        setFormError(null);
        const result = await createAdminEmployeeAction({
          name,
          email,
          password: form.password,
          role: form.role.trim(),
          department: form.department.trim(),
          kind: form.kind,
          image: form.image,
          active: form.active,
        });
        if (!result.ok) {
          setFormError(
            result.reason === "conflict"
              ? "That email is already in use."
              : result.reason === "validation"
                ? "Check the fields and try again."
                : result.reason === "unauthorized"
                  ? "You are not allowed to add employees."
                  : "Could not create employee. Try again.",
          );
          return;
        }
        if (!("employee" in result)) {
          setFormError("Could not create employee. Try again.");
          return;
        }
        setEmployees([...state.employees, result.employee]);
        setModalOpen(false);
      });
      return;
    }

    startTransition(async () => {
      setFormError(null);
      const result = await updateAdminEmployeeAction({
        employeeId: editingId,
        name,
        email,
        role: form.role.trim(),
        department: form.department.trim(),
        kind: form.kind,
        image: form.image,
        active: form.active,
      });
      if (!result.ok) {
        setFormError(
          result.reason === "conflict"
            ? "This employee was updated elsewhere. Refresh and try again."
            : result.reason === "validation"
              ? "Check the fields and try again."
              : result.reason === "unauthorized"
                ? "You are not allowed to edit employees."
                : "Could not update employee. Try again.",
        );
        return;
      }
      if (!("employee" in result)) {
        setFormError("Could not update employee. Try again.");
        return;
      }
      setEmployees(
        state.employees.map((item) =>
          item.id === editingId ? result.employee : item,
        ),
      );
      setModalOpen(false);
    });
  };

  const savePassword = () => {
    if (!passwordEmployeeId) {
      return;
    }
    if (password.length < 8 || password.length > 200) {
      setPasswordError("Password must be 8–200 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    startPasswordTransition(async () => {
      setPasswordError(null);
      const result = await setAdminEmployeePasswordAction({
        employeeId: passwordEmployeeId,
        password,
      });
      if (!result.ok) {
        setPasswordError(
          result.reason === "validation"
            ? "Password must be 8–200 characters."
            : result.reason === "conflict"
              ? "Could not update password. Try again."
              : result.reason === "unauthorized"
                ? "You are not allowed to set this password."
                : "Could not update password. Try again.",
        );
        return;
      }
      setPasswordOpen(false);
      setPasswordEmployeeId(null);
      setPassword("");
      setConfirmPassword("");
    });
  };

  const confirmDelete = () => {
    if (!deleteId || deletePending) {
      return;
    }

    startDeleteTransition(async () => {
      setDeleteError(null);
      const result = await archiveAdminEmployeeAction({
        employeeId: deleteId,
      });
      if (!result.ok) {
        setDeleteError(
          result.reason === "conflict"
            ? "This employee was updated elsewhere. Refresh and try again."
            : result.reason === "unauthorized"
              ? "You are not allowed to delete employees."
              : "Could not delete employee. Try again.",
        );
        return;
      }
      setEmployees(state.employees.filter((item) => item.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    });
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
                            src={cmsMediaSrc(item.image)}
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
                          : "bg-[rgba(92, 104, 73,0.12)] text-brand"
                      }`}
                    >
                      {employeeKindLabel[item.kind]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                        item.active
                          ? "bg-[rgba(92, 104, 73,0.16)] text-brand"
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
                        aria-label="Set password"
                        onClick={() => openPassword(item)}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
                      >
                        <KeyIcon className="size-4" />
                      </button>
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
                          setDeleteError(null);
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
        onClose={() => {
          if (pending) {
            return;
          }
          setModalOpen(false);
        }}
        onSubmit={save}
        submitLabel={
          pending ? "Saving…" : editingId ? "Save" : "Create employee"
        }
      >
        <div>
          <label className="block">
            <span className={adminLabelClass}>Name</span>
            <input
              className={adminFieldClass}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
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
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </label>
        </div>
        {!editingId ? (
          <>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Password</span>
                <div className="relative">
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`${adminFieldClass} pr-12`}
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    aria-label={
                      showCreatePassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowCreatePassword((value) => !value)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-black/45"
                  >
                    {showCreatePassword ? (
                      <EyeOffIcon className="size-5" />
                    ) : (
                      <EyeIcon className="size-5" />
                    )}
                  </button>
                </div>
              </label>
            </div>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Confirm password</span>
                <div className="relative">
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`${adminFieldClass} pr-12`}
                    value={form.confirmPassword}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    aria-label={
                      showCreatePassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowCreatePassword((value) => !value)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-black/45"
                  >
                    {showCreatePassword ? (
                      <EyeOffIcon className="size-5" />
                    ) : (
                      <EyeIcon className="size-5" />
                    )}
                  </button>
                </div>
              </label>
            </div>
          </>
        ) : null}
        <div>
          <label className="block">
            <span className={adminLabelClass}>Role</span>
            <input
              className={adminFieldClass}
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value }))
              }
            />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Department</span>
            <input
              className={adminFieldClass}
              value={form.department}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  department: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <AdminImageField
          label="Image"
          value={form.image}
          onChange={(image) => setForm((current) => ({ ...current, image }))}
        />
        <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
          <input
            type="checkbox"
            checked={form.kind === "sales"}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                kind: event.target.checked ? "sales" : "delivery",
              }))
            }
          />
          Sales
        </label>
        <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                active: event.target.checked,
              }))
            }
          />
          Active
        </label>
        {formError ? (
          <p className="text-[0.84rem] font-semibold text-[#e8891a]">
            {formError}
          </p>
        ) : null}
      </AdminFormModal>

      <AdminFormModal
        open={passwordOpen}
        title={`Set password${passwordTarget ? ` — ${passwordTarget.name}` : ""}`}
        onClose={() => {
          if (passwordPending) {
            return;
          }
          setPasswordOpen(false);
          setPasswordEmployeeId(null);
          setPasswordError(null);
        }}
        onSubmit={savePassword}
        submitLabel={passwordPending ? "Saving…" : "Save password"}
      >
        <div>
          <label className="block">
            <span className={adminLabelClass}>New password</span>
            <div className="relative">
              <input
                type={showSetPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`${adminFieldClass} pr-12`}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                aria-label={
                  showSetPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowSetPassword((value) => !value)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-black/45"
              >
                {showSetPassword ? (
                  <EyeOffIcon className="size-5" />
                ) : (
                  <EyeIcon className="size-5" />
                )}
              </button>
            </div>
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Confirm password</span>
            <div className="relative">
              <input
                type={showSetPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`${adminFieldClass} pr-12`}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <button
                type="button"
                aria-label={
                  showSetPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowSetPassword((value) => !value)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-black/45"
              >
                {showSetPassword ? (
                  <EyeOffIcon className="size-5" />
                ) : (
                  <EyeIcon className="size-5" />
                )}
              </button>
            </div>
          </label>
        </div>
        {passwordError ? (
          <p className="text-[0.84rem] font-semibold text-[#e8891a]">
            {passwordError}
          </p>
        ) : null}
      </AdminFormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete employee"
        lede={
          deleteError ??
          `Remove "${deleteTarget?.name ?? "this employee"}" from the directory?`
        }
        onClose={() => {
          if (deletePending) {
            return;
          }
          setDeleteOpen(false);
          setDeleteId(null);
          setDeleteError(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
