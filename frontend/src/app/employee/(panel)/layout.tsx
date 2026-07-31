import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmployeeShell } from "@/components/employee/EmployeeShell";
import { initialAdminDemoState } from "@/constants/adminDemo";
import { clearSession, requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Employee",
};

export default async function EmployeePanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession("employee");
  const employee = initialAdminDemoState.employees.find(
    (item) => item.id === session.subjectId && item.active,
  );

  if (!employee) {
    await clearSession();
    redirect("/employee/login");
  }

  return (
    <EmployeeShell employeeId={session.subjectId}>{children}</EmployeeShell>
  );
}
