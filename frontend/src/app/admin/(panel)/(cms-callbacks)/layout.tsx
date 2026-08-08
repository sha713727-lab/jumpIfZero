import { AdminDomainGate } from "@/components/admin/AdminDomainGate";

export default function AdminCmsCallbacksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDomainGate domain="callbacks">{children}</AdminDomainGate>;
}
