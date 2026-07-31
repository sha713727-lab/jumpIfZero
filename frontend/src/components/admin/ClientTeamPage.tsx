"use client";

import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminDemo } from "@/components/admin/AdminDemoProvider";
import { adminEmptyCopy } from "@/constants/admin";
import { EmptyState } from "@/components/ui/EmptyState";

const cardClass =
  "rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6";

export function ClientTeamPage() {
  const params = useParams();
  const { state, assignEmployees } = useAdminDemo();

  const clientId = typeof params.id === "string" ? params.id : "";
  const client = state.clients.find((item) => item.id === clientId);

  if (!client) {
    return null;
  }

  const toggle = (employeeId: string) => {
    const current = client.assignedEmployeeIds;
    const next = current.includes(employeeId)
      ? current.filter((id) => id !== employeeId)
      : [...current, employeeId];
    assignEmployees(clientId, next);
  };

  const deliveryEmployees = state.employees.filter(
    (employee) => employee.kind === "delivery" && employee.active,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Team"
        lede="Assign internal employees to this client account."
      />

      <section className={cardClass}>
        {deliveryEmployees.length === 0 ? (
          <EmptyState message={adminEmptyCopy.clientTeam} />
        ) : (
          <ul className="divide-y divide-black/8">
            {deliveryEmployees.map((employee) => {
              const checked = client.assignedEmployeeIds.includes(employee.id);

              return (
                <li key={employee.id}>
                  <label className="flex cursor-pointer items-center gap-4 py-4">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(employee.id)}
                      className="size-4 rounded border-black/20"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.92rem] font-semibold text-[#0d120b]">
                        {employee.name}
                      </p>
                      <p className="text-[0.82rem] font-medium text-black/45">
                        {employee.role} · {employee.department}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                        employee.active
                          ? "bg-[rgba(116,129,95,0.16)] text-brand"
                          : "bg-black/8 text-black/45"
                      }`}
                    >
                      {employee.active ? "Active" : "Inactive"}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
