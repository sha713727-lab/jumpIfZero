import { AdminDomainGate } from "@/components/admin/AdminDomainGate";

export default function AdminCrmSalesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDomainGate domain="crm-sales">{children}</AdminDomainGate>;
}
