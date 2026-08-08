import { CustomerDomainGate } from "@/components/dashboard/CustomerDomainGate";

export default function DashboardProjectsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CustomerDomainGate domain="projects">{children}</CustomerDomainGate>;
}
