import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginPageClient } from "@/components/admin/AdminLoginPageClient";
import { verifySession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin login",
};

export default async function AdminLoginPage() {
  const session = await verifySession("admin");

  if (session) {
    redirect("/admin");
  }

  return <AdminLoginPageClient />;
}
