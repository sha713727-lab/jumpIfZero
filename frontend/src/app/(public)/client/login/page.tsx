import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginPageClient } from "@/components/login/LoginPageClient";
import { verifySession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Client login",
  description: "Sign in to your JZ Enterprises client dashboard.",
};

export default async function ClientLoginPage() {
  const session = await verifySession("customer");

  if (session) {
    redirect("/dashboard");
  }

  return <LoginPageClient />;
}
