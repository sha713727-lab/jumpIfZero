import { AdminDomainGate } from "@/components/admin/AdminDomainGate";

export default function AdminSecurityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDomainGate domain="security">{children}</AdminDomainGate>;
}
