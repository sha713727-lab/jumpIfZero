"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { useAdmin } from "@/components/admin/AdminProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { site } from "@/constants/site";
import type { AdminSalarySlip } from "@/lib/data/admin";
import { getAdminSiteContactAction } from "@/lib/submitAdminSiteContact";
import {
  archiveSalarySlipAction,
  createSalarySlipAction,
} from "@/lib/submitOps";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type SalaryForm = {
  employeeId: string;
  designation: string;
  slipDate: string;
  salaryMonth: string;
  basicSalary: string;
  punctuality: string;
  medicalAllowance: string;
  incentives: string;
  bonus: string;
  advance: string;
  incomeTax: string;
  whTax: string;
  fuelAdvances: string;
  currency: string;
  status: "draft" | "issued";
  fromCompany: string;
  fromEmail: string;
  fromPhone: string;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentSalaryMonth(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

const emptyForm: SalaryForm = {
  employeeId: "",
  designation: "",
  slipDate: todayIso(),
  salaryMonth: currentSalaryMonth(),
  basicSalary: "0",
  punctuality: "0",
  medicalAllowance: "0",
  incentives: "0",
  bonus: "0",
  advance: "0",
  incomeTax: "0",
  whTax: "0",
  fuelAdvances: "0",
  currency: "PKR",
  status: "draft",
  fromCompany: site.legalName,
  fromEmail: "",
  fromPhone: "",
};

const statusClass: Record<AdminSalarySlip["status"], string> = {
  draft: "bg-black/8 text-black/50",
  issued: "bg-[rgba(92,104,73,0.16)] text-brand",
};

const statusLabel: Record<AdminSalarySlip["status"], string> = {
  draft: "Draft",
  issued: "Issued",
};

function moneySum(values: readonly string[]): number {
  return values.reduce((sum, value) => {
    const n = Number(value.replace(/[^\d.]/g, ""));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

export function SalariesPage() {
  const { state, ensureDomain, setSalarySlips } = useAdmin();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SalaryForm>(emptyForm);

  useEffect(() => {
    void ensureDomain("ops");
  }, [ensureDomain]);

  useEffect(() => {
    if (!createOpen) {
      return;
    }
    void getAdminSiteContactAction().then((result) => {
      if (!result.ok) {
        return;
      }
      setForm((current) => ({
        ...current,
        fromEmail:
          current.fromEmail.length > 0 ? current.fromEmail : result.data.email,
        fromPhone:
          current.fromPhone.length > 0 ? current.fromPhone : result.data.phone,
      }));
    });
  }, [createOpen]);

  const openCreate = () => {
    setError(null);
    setForm({
      ...emptyForm,
      slipDate: todayIso(),
      salaryMonth: currentSalaryMonth(),
      employeeId: state.employees[0]?.id ?? "",
      designation: state.employees[0]?.role ?? "",
    });
    setCreateOpen(true);
  };

  const totalEarnings = moneySum([
    form.basicSalary,
    form.punctuality,
    form.medicalAllowance,
    form.incentives,
    form.bonus,
  ]);
  const totalDeduction = moneySum([
    form.advance,
    form.incomeTax,
    form.whTax,
    form.fuelAdvances,
  ]);
  const netSalary = totalEarnings - totalDeduction;

  const saveCreate = () => {
    if (pending) {
      return;
    }
    if (form.employeeId.length === 0 || form.salaryMonth.trim().length === 0) {
      setError("Select an employee and enter the salary month.");
      return;
    }
    if (netSalary < 0) {
      setError("Net salary cannot be negative.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await createSalarySlipAction({
        employeeId: form.employeeId,
        designation: form.designation,
        slipDate: form.slipDate,
        salaryMonth: form.salaryMonth.trim(),
        basicSalary: form.basicSalary,
        punctuality: form.punctuality,
        medicalAllowance: form.medicalAllowance,
        incentives: form.incentives,
        bonus: form.bonus,
        advance: form.advance,
        incomeTax: form.incomeTax,
        whTax: form.whTax,
        fuelAdvances: form.fuelAdvances,
        currency: form.currency.trim().toUpperCase() || "PKR",
        statusCode: form.status,
        fromCompany: form.fromCompany,
        fromEmail: form.fromEmail,
        fromPhone: form.fromPhone,
      });
      if (!result.ok || !("data" in result)) {
        setError(
          result.ok
            ? "Could not create salary slip."
            : result.reason === "conflict"
              ? "A slip already exists for this employee and month."
              : result.reason === "validation"
                ? "Check the amounts and try again."
                : "Could not create salary slip.",
        );
        return;
      }
      setSalarySlips([result.data, ...state.salarySlips]);
      setCreateOpen(false);
    });
  };

  const confirmDelete = () => {
    if (!deleteId || pending) {
      return;
    }
    const existing = state.salarySlips.find((item) => item.id === deleteId);
    if (!existing) {
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await archiveSalarySlipAction({
        id: existing.id,
        version: existing.version,
      });
      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "This slip was updated elsewhere. Refresh and try again."
            : "Could not delete salary slip.",
        );
        return;
      }
      setSalarySlips(state.salarySlips.filter((item) => item.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    });
  };

  const deleteTarget = state.salarySlips.find((item) => item.id === deleteId);
  const activeEmployees = state.employees.filter((item) => item.active);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Salaries"
        lede="Create and print salary slips for employees."
        actionLabel="Create salary slip"
        onAction={openCreate}
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className={cardClass} aria-busy={pending}>
        {state.salarySlips.length === 0 ? (
          <EmptyState message="No salary slips yet. Create one to get started." />
        ) : (
          <ul className="divide-y divide-black/8">
            {state.salarySlips.map((slip) => (
              <li
                key={slip.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-[0.92rem] font-semibold text-[#0d120b]">
                    {slip.employeeName}
                  </p>
                  <p className="text-[0.82rem] font-medium text-black/45">
                    {slip.salaryMonth}
                    {slip.designation ? ` · ${slip.designation}` : ""} ·{" "}
                    {slip.currency} {slip.netSalary}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${statusClass[slip.status]}`}
                  >
                    {statusLabel[slip.status]}
                  </span>
                  <a
                    href={`/admin/salaries/${slip.id}/print`}
                    className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-brand"
                  >
                    Print
                  </a>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setDeleteId(slip.id);
                      setDeleteOpen(true);
                    }}
                    className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-[#0d120b] disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdminFormModal
        open={createOpen}
        title="Create salary slip"
        onClose={() => setCreateOpen(false)}
        onSubmit={saveCreate}
        submitLabel="Create slip"
      >
        <div className="space-y-4">
          <label className="block">
            <span className={adminLabelClass}>Employee</span>
            <select
              className={adminFieldClass}
              value={form.employeeId}
              onChange={(event) => {
                const employee = activeEmployees.find(
                  (item) => item.id === event.target.value,
                );
                setForm((current) => ({
                  ...current,
                  employeeId: event.target.value,
                  designation: employee?.role ?? current.designation,
                }));
              }}
            >
              <option value="">Select employee</option>
              {activeEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={adminLabelClass}>Designation</span>
              <input
                className={adminFieldClass}
                value={form.designation}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    designation: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Salary month</span>
              <input
                className={adminFieldClass}
                value={form.salaryMonth}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    salaryMonth: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Date</span>
              <input
                type="date"
                className={adminFieldClass}
                value={form.slipDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slipDate: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Currency</span>
              <input
                className={adminFieldClass}
                value={form.currency}
                maxLength={3}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    currency: event.target.value.toUpperCase(),
                  }))
                }
              />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Status</span>
              <select
                className={adminFieldClass}
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as "draft" | "issued",
                  }))
                }
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
              </select>
            </label>
          </div>

          <p className="text-[0.84rem] font-bold text-[#0d120b]">Earnings</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["basicSalary", "Basic salary"],
                ["punctuality", "Punctuality"],
                ["medicalAllowance", "Medical allowance"],
                ["incentives", "Incentives"],
                ["bonus", "Bonus"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className={adminLabelClass}>{label}</span>
                <input
                  className={adminFieldClass}
                  value={form[key]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>

          <p className="text-[0.84rem] font-bold text-[#0d120b]">Deductions</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["advance", "Advance"],
                ["incomeTax", "Income tax"],
                ["whTax", "W.H. tax"],
                ["fuelAdvances", "Fuel advances"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className={adminLabelClass}>{label}</span>
                <input
                  className={adminFieldClass}
                  value={form[key]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-black/8 bg-[rgba(92,104,73,0.08)] px-4 py-3 text-[0.88rem] font-semibold">
            <p>Total earnings: {totalEarnings.toFixed(2)}</p>
            <p>Total deduction: {totalDeduction.toFixed(2)}</p>
            <p className="mt-1 text-[1rem] font-extrabold">
              Net salary: {netSalary.toFixed(2)}
            </p>
          </div>
        </div>
      </AdminFormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete salary slip"
        lede={
          deleteTarget
            ? `Delete the salary slip for ${deleteTarget.employeeName} (${deleteTarget.salaryMonth})?`
            : "Delete this salary slip?"
        }
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
