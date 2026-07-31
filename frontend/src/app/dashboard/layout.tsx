import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { demoCustomer } from "@/constants/demoCustomer";
import { clearSession, requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Customer dashboard",
  description: "JZ Enterprises customer portal — projects, invoices, and files.",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession("customer");

  if (session.subjectId !== demoCustomer.id) {
    await clearSession();
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
