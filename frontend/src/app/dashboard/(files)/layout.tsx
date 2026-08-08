import { CustomerDomainGate } from "@/components/dashboard/CustomerDomainGate";

export default function DashboardFilesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CustomerDomainGate domain="files">{children}</CustomerDomainGate>;
}
