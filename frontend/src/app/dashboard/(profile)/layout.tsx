import { CustomerDomainGate } from "@/components/dashboard/CustomerDomainGate";

export default function DashboardProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CustomerDomainGate domain="shell">{children}</CustomerDomainGate>;
}
