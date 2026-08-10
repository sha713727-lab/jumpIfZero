import type { Metadata } from "next";
import { EmployeeShell } from "@/components/employee/EmployeeShell";
import { requireEmployeeSession } from "@/lib/auth/requireEmployeeAccess";
import { actorSchema } from "@jumpifzero/contracts/content";
import { loadEmployeeSelf } from "@/lib/data/employeeDeliveryBootstrap";
import type { AdminEmployee } from "@/lib/data/admin";

export const metadata: Metadata = {
  title: "Employee",
};

function fallbackEmployee(access: Awaited<
  ReturnType<typeof requireEmployeeSession>
>): AdminEmployee {
  return {
    id: access.employeeId,
    name: access.session.name,
    email: access.session.email,
    role: access.kind === "sales" ? "Sales" : "Delivery",
    department: access.kind === "sales" ? "Sales" : "Delivery",
    kind: access.kind,
    image: "",
    version: 1,
    active: true,
    teamMemberId: null,
    updatedAt: "",
  };
}

export default async function EmployeePanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await requireEmployeeSession();
  const actor = actorSchema.parse({
    subjectId: access.session.subjectId,
    role: "employee",
    employeeKind: access.kind,
  });
  let employee: AdminEmployee;
  try {
    employee = await loadEmployeeSelf(actor, access.employeeId);
  } catch {
    employee = fallbackEmployee(access);
  }
  return <EmployeeShell employee={employee}>{children}</EmployeeShell>;
}
