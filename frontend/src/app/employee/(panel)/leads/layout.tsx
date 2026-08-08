import { EmployeeDomainGate } from "@/components/employee/EmployeeDomainGate";
import { requireEmployeeKind } from "@/lib/auth/requireEmployeeAccess";

export default async function EmployeeLeadsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireEmployeeKind("sales");
  return <EmployeeDomainGate domain="crm">{children}</EmployeeDomainGate>;
}
