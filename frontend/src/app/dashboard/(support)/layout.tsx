import { CustomerDomainGate } from "@/components/dashboard/CustomerDomainGate";

export default function DashboardSupportLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CustomerDomainGate domain="shell">{children}</CustomerDomainGate>;
}
