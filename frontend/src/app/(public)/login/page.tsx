import type { Metadata } from "next";
import { LoginPageClient } from "@/components/login/LoginPageClient";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to JZ Enterprises.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
