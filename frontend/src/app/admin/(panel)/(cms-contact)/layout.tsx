import { AdminDomainGate } from "@/components/admin/AdminDomainGate";

export default function AdminCmsContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDomainGate domain="contact">{children}</AdminDomainGate>;
}
