import { AdminDomainGate } from "@/components/admin/AdminDomainGate";

export default function AdminCrmLeadsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDomainGate domain="crm-leads">{children}</AdminDomainGate>;
}
