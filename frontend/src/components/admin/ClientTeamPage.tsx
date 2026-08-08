"use client";

import { useTransition } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import { adminEmptyCopy } from "@/constants/admin";
import { putAssignmentsAction } from "@/lib/submitOps";
import { EmptyState } from "@/components/ui/EmptyState";

const cardClass =
  "rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6";

export function ClientTeamPage() {
  const params = useParams();
  const { state, assignEmployees } = useAdmin();
  const [pending, startTransition] = useTransition();

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
    startTransition(async () => {
      const result = await putAssignmentsAction({
        clientId,
        employeeIds: next,
      });
      if (result.ok) {
        assignEmployees(clientId, next);
      }
    });
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
      <div className={cardClass} aria-busy={pending}>
        {deliveryEmployees.length === 0 ? (
          <EmptyState message={adminEmptyCopy.clientTeam} />
        ) : (
          <ul className="space-y-3">
            {deliveryEmployees.map((employee) => {
              const assigned = client.assignedEmployeeIds.includes(employee.id);
              return (
                <li key={employee.id}>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-black/8 px-4 py-3">
                    <span>
                      <span className="block text-[0.92rem] font-semibold text-[#0d120b]">
                        {employee.name}
                      </span>
                      <span className="block text-[0.78rem] font-medium text-black/45">
                        {employee.email}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={assigned}
                      onChange={() => toggle(employee.id)}
                      disabled={pending}
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
