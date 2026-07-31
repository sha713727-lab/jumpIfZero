"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import { useEmployeeDemo } from "@/components/employee/EmployeeDemoProvider";
import { employeeEmptyCopy } from "@/constants/employee";
import { leadStatusLabel } from "@/constants/sales";
import type { LeadStatus } from "@/constants/adminDemo";
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

export function LeadsListPage() {
  const router = useRouter();
  const { state } = useEmployeeDemo();

  const leads = [...state.leads].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        title="Leads"
        lede="Prospects and follow-up pipeline."
        actionLabel="Add lead"
        onAction={() => router.push("/employee/leads/new")}
      />

      <div className={cardClass}>
        {leads.length === 0 ? (
          <EmptyState message={employeeEmptyCopy.leads} />
        ) : (
          <ul className="divide-y divide-black/8">
            {leads.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/employee/leads/${lead.id}`}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[0.92rem] font-semibold text-[#0d120b]">
                      {lead.company}
                    </p>
                    <p className="text-[0.82rem] font-medium text-black/45">
                      {lead.contactName} · {lead.source}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${statusPillClass[lead.status]}`}
                    >
                      {leadStatusLabel[lead.status]}
                    </span>
                    <span className="text-[0.8rem] font-medium text-black/35">
                      {lead.updatedAt}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
