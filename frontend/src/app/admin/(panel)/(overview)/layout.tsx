import { AdminDomainGate } from "@/components/admin/AdminDomainGate";

export default function AdminOverviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDomainGate domain="overview">{children}</AdminDomainGate>;
}
