import type { Metadata } from "next";
import { ServicesPageClient } from "@/components/services/ServicesPageClient";
import { getServiceChapters } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website, software, apps, SEO, marketing, design, security, and bug fixes — eight services as one growth system from JZ Enterprises.",
};

export default async function ServicesPage() {
  const serviceChapters = await getServiceChapters();
  return <ServicesPageClient serviceChapters={serviceChapters} />;
}
