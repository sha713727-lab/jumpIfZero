import type { Metadata } from "next";
import { DashboardProvider } from "@/components/dashboard/DashboardProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Customer dashboard",
  description: "JZ Enterprises customer portal — projects, invoices, and files.",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSession("customer");
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
