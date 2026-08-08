import { CustomerDomainGate } from "@/components/dashboard/CustomerDomainGate";

export default function DashboardHomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CustomerDomainGate domain="home">{children}</CustomerDomainGate>;
}
