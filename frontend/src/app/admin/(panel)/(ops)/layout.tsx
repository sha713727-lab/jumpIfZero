import { AdminDomainGate } from "@/components/admin/AdminDomainGate";

export default function AdminOpsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDomainGate domain="ops">{children}</AdminDomainGate>;
}
