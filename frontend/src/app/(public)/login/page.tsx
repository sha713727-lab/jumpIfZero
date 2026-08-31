import type { Metadata } from "next";
import { LoginRoleSelectClient } from "@/components/login/LoginRoleSelectClient";

export const metadata: Metadata = {
  title: "Login",
  description: "Choose how to sign in to JZ Enterprises.",
};

export default function LoginPage() {
  return <LoginRoleSelectClient />;
}
