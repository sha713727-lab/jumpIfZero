import type { Metadata } from "next";
import { EmployeeShell } from "@/components/employee/EmployeeShell";
import { requireEmployeeSession } from "@/lib/auth/requireEmployeeAccess";

export const metadata: Metadata = {
  title: "Employee",
};

export default async function EmployeePanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await requireEmployeeSession();

  return (
    <EmployeeShell employeeId={access.employeeId}>{children}</EmployeeShell>
  );
}
