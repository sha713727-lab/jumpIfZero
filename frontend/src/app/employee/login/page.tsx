import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmployeeLoginPageClient } from "@/components/employee/EmployeeLoginPageClient";
import { verifySession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Employee login",
};

export default async function EmployeeLoginPage() {
  const session = await verifySession("employee");

  if (session) {
    redirect("/employee");
  }

  return <EmployeeLoginPageClient />;
}
