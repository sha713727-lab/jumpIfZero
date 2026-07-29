import type { Metadata } from "next";
import { ServicesPageClient } from "@/components/services/ServicesPageClient";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website, software, apps, SEO, marketing, design, security, and bug fixes — eight services as one growth system from JZ Enterprises.",
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
