import type { Metadata } from "next";
import { AboutPageClient } from "@/components/about/AboutPageClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "JZ Enterprises designs end-to-end digital systems around your goals — strategy, design, development, and growth as one system.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
