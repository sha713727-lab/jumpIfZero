import { ClientWorkspaceLayout } from "@/components/admin/ClientWorkspaceLayout";

export default function ClientWorkspaceRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientWorkspaceLayout>{children}</ClientWorkspaceLayout>;
}
