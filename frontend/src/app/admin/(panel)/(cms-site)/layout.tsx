import { AdminDomainGate } from "@/components/admin/AdminDomainGate";

export default function CmsSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDomainGate domain="cms-site">{children}</AdminDomainGate>;
}
