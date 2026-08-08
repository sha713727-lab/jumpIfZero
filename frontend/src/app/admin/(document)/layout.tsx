import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice",
};

export default function AdminDocumentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
