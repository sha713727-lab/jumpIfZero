import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}
