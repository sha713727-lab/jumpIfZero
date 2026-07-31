import { initialAdminDemoState } from "@/constants/adminDemo";

export function getGoogleDemoEmployeeId(): string | null {
  const assignedIds = new Set(
    initialAdminDemoState.clients.flatMap((client) => client.assignedEmployeeIds),
  );

  const employee = initialAdminDemoState.employees.find(
    (item) => item.active && assignedIds.has(item.id),
  );

  return employee?.id ?? null;
}
