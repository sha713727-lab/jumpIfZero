import type { Metadata } from "next";
import { EmployeeShell } from "@/components/employee/EmployeeShell";

export const metadata: Metadata = {
  title: "Employee",
};

export default function EmployeePanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <EmployeeShell>{children}</EmployeeShell>;
}
