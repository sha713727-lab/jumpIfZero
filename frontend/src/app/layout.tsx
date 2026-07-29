import type { Metadata } from "next";
import { site } from "@/constants/site";
import { env } from "@/lib/env";
import { nourd } from "@/lib/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nourd.variable}>
      <body className={`${nourd.className} antialiased`}>{children}</body>
    </html>
  );
}
