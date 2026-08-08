import { AdminDomainGate } from "@/components/admin/AdminDomainGate";

export default function AdminCmsCatalogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDomainGate domain="cms-catalog">{children}</AdminDomainGate>;
}
