import { CustomerDomainGate } from "@/components/dashboard/CustomerDomainGate";

export default function DashboardInvoicesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CustomerDomainGate domain="invoices">{children}</CustomerDomainGate>;
}
