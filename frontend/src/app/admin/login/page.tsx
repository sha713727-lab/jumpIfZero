import type { Metadata } from "next";
import { AdminLoginPageClient } from "@/components/admin/AdminLoginPageClient";

export const metadata: Metadata = {
  title: "Admin login",
};

export default function AdminLoginPage() {
  return <AdminLoginPageClient />;
}
