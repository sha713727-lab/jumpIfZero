import { EmployeeDomainGate } from "@/components/employee/EmployeeDomainGate";
import { requireEmployeeKind } from "@/lib/auth/requireEmployeeAccess";

export default async function EmployeeProjectsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireEmployeeKind("delivery");
  return (
    <EmployeeDomainGate domain="delivery">{children}</EmployeeDomainGate>
  );
}
