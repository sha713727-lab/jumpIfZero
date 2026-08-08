import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminActor } from "@/lib/data/adminSession";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { identity } = await requireAdminActor();
  return <AdminShell identity={identity}>{children}</AdminShell>;
}
