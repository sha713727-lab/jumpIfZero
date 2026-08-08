import { AdminDomainGate } from "@/components/admin/AdminDomainGate";

export default function AdminCmsTeamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDomainGate domain="cms-team">{children}</AdminDomainGate>;
}
