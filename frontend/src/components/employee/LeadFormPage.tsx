"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import { useEmployee } from "@/components/employee/EmployeeProvider";
import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { leadStatuses, leadStatusLabel } from "@/constants/sales";
import type { LeadStatus } from "@/lib/data/admin";
import { createLeadAction } from "@/lib/submitCrm";

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
  const { state, setLeads } = useEmployee();
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [pending, startTransition] = useTransition();

  const save = () => {
    const company = form.company.trim();
    if (!company) {
      return;
    }

    startTransition(async () => {
      const result = await createLeadAction({
        company,
        contactName: form.contactName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        source: form.source.trim(),
        statusCode: form.status,
        notes: form.notes.trim(),
      });

      if (result.ok && "data" in result) {
        setLeads([...state.leads, result.data]);
        router.push(`/employee/leads/${result.data.id}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        title="New lead"
        lede="Add a prospect to your pipeline."
      />

      <section className={`${cardClass} space-y-4`}>
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
            className={`${adminFieldClass} min-h-[6rem] resize-y`}
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
          />
          </label>
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
            disabled={pending}
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
