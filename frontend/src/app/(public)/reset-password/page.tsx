import type { Metadata } from "next";
import { ResetPasswordPageClient } from "@/components/login/ResetPasswordPageClient";
import { pageMetadata } from "@/lib/pageMetadata";

type ResetPasswordPageProps = {
  readonly searchParams: Promise<{ token?: string | string[] }>;
};

export function generateMetadata(): Metadata {
  return {
    ...pageMetadata({
      title: "Reset password",
      description: "Choose a new password for your JZ Enterprises account.",
      path: "/reset-password",
    }),
    robots: { index: false, follow: false },
  };
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const raw = params.token;
  const resetToken = typeof raw === "string" ? raw : "";

  return <ResetPasswordPageClient resetToken={resetToken} />;
}
