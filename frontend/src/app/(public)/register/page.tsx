import type { Metadata } from "next";
import { RegisterPageClient } from "@/components/register/RegisterPageClient";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your JZ Enterprises customer account.",
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}
