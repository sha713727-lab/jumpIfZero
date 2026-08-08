import { AdminDomainGate } from "@/components/admin/AdminDomainGate";

export default function AdminOpsEmployeesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDomainGate domain="employees">{children}</AdminDomainGate>;
}
