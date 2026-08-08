import { CustomerDomainGate } from "@/components/dashboard/CustomerDomainGate";

export default function DashboardMessagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CustomerDomainGate domain="messages">{children}</CustomerDomainGate>;
}
