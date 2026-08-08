"use client";

import Link from "next/link";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import { useEmployee } from "@/components/employee/EmployeeProvider";
import { employeeEmptyCopy } from "@/constants/employee";
import { EmptyState } from "@/components/ui/EmptyState";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

export function ClientsPage() {
  const { state } = useEmployee();

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        title="Clients"
        lede="Accounts assigned to you."
      />

      <div className={cardClass}>
        {state.clients.length === 0 ? (
          <EmptyState message={employeeEmptyCopy.clients} />
        ) : (
          <ul className="divide-y divide-black/8">
            {state.clients.map((client) => {
              const projectCount = state.projects.filter(
                (project) => project.clientId === client.id,
              ).length;

              return (
                <li key={client.id}>
                  <Link
                    href={`/employee/clients/${client.id}`}
                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-10 items-center justify-center rounded-full bg-logo-gradient text-[0.78rem] font-extrabold text-[#0d120b]">
                        {client.initials}
                      </span>
                      <div>
                        <p className="text-[0.95rem] font-bold text-[#0d120b]">
                          {client.name}
                        </p>
                        <p className="text-[0.82rem] font-medium text-black/45">
                          {client.company} · {client.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[0.82rem] font-medium text-black/40">
                        {projectCount} projects
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                          client.status === "active"
                            ? "bg-[rgba(92,104,73,0.16)] text-brand"
                            : "bg-black/8 text-black/45"
                        }`}
                      >
                        {client.status === "active" ? "Active" : "Paused"}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
