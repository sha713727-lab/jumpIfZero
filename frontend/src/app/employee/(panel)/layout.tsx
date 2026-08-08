import type { Metadata } from "next";
import { EmployeeShell } from "@/components/employee/EmployeeShell";
import { requireEmployeeSession } from "@/lib/auth/requireEmployeeAccess";
import type { AdminEmployee } from "@/lib/data/admin";

export const metadata: Metadata = {
  title: "Employee",
};

function employeeFromSession(access: Awaited<
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
  return (
    <EmployeeShell employee={employeeFromSession(access)}>
      {children}
    </EmployeeShell>
  );
}
