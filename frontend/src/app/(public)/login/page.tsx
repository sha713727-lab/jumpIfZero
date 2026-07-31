import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginPageClient } from "@/components/login/LoginPageClient";
import { verifySession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to JZ Enterprises.",
};

export default async function LoginPage() {
  const session = await verifySession("customer");

  if (session) {
    redirect("/dashboard");
  }

  return <LoginPageClient />;
}
