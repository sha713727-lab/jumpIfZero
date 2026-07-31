import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { demoAdmin } from "@/constants/adminAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { clearSession, requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession("admin");

  if (session.subjectId !== demoAdmin.id) {
    await clearSession();
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
