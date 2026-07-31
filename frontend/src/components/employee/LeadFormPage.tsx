"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import {
  employeeTodayLabel,
  useEmployeeDemo,
} from "@/components/employee/EmployeeDemoProvider";
import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { leadStatuses, leadStatusLabel } from "@/constants/sales";
import type { AdminLead, LeadStatus } from "@/lib/data/admin";

const cardClass =
  "rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6";

type LeadForm = {
  company: string;
  contactName: string;
  phone: string;
  email: string;
  source: string;
  status: LeadStatus;
  notes: string;
};

const emptyForm: LeadForm = {
  company: "",
  contactName: "",
  phone: "",
  email: "",
  source: "",
  status: "new",
  notes: "",
};

export function LeadFormPage() {
  const router = useRouter();
  const { state, setLeads } = useEmployeeDemo();
  const [form, setForm] = useState<LeadForm>(emptyForm);

  const save = () => {
    const company = form.company.trim();
    if (!company) {
      return;
    }

    const payload: AdminLead = {
      id: crypto.randomUUID(),
      repId: state.employee.id,
      company,
      contactName: form.contactName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      source: form.source.trim(),
      status: form.status,
      notes: form.notes.trim(),
      updatedAt: employeeTodayLabel(),
    };

    setLeads([...state.leads, payload]);
    router.push(`/employee/leads/${payload.id}`);
  };

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        title="New lead"
        lede="Add a prospect to your pipeline."
      />

      <section className={`${cardClass} space-y-4`}>
        <div>
          <label className={adminLabelClass}>Company</label>
          <input
            className={adminFieldClass}
            value={form.company}
            onChange={(event) =>
              setForm((current) => ({ ...current, company: event.target.value }))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Contact name</label>
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
        </div>
        <div>
          <label className={adminLabelClass}>Phone</label>
          <input
            className={adminFieldClass}
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
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
          <label className={adminLabelClass}>Source</label>
          <input
            className={adminFieldClass}
            value={form.source}
            onChange={(event) =>
              setForm((current) => ({ ...current, source: event.target.value }))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Status</label>
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
        </div>
        <div>
          <label className={adminLabelClass}>Notes</label>
          <textarea
            className={`${adminFieldClass} min-h-[6rem] resize-y`}
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.push("/employee/leads")}
            className="rounded-xl border border-black/12 bg-white px-4 py-2.5 text-[0.88rem] font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream"
          >
            Save
          </button>
        </div>
      </section>
    </div>
  );
}
