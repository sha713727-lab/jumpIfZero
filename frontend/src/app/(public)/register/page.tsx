import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterPageClient } from "@/components/login/RegisterPageClient";
import { verifySession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a JZ Enterprises client account.",
};

export default async function RegisterPage() {
  const session = await verifySession("customer");

  if (session) {
    redirect("/dashboard");
  }

  return <RegisterPageClient />;
}
