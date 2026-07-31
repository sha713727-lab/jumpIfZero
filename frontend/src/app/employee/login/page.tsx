import type { Metadata } from "next";
import { EmployeeLoginPageClient } from "@/components/employee/EmployeeLoginPageClient";

export const metadata: Metadata = {
  title: "Employee login",
};

export default function EmployeeLoginPage() {
  return <EmployeeLoginPageClient />;
}
