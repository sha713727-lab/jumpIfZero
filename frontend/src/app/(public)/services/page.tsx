import type { Metadata } from "next";
import { ServicesPageClient } from "@/components/services/ServicesPageClient";
import { getServiceChapters } from "@/lib/data/services";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Website, software, apps, SEO, marketing, design, security, and bug fixes — eight services as one growth system from JZ Enterprises.",
  path: "/services",
});

export default async function ServicesPage() {
  const serviceChapters = await getServiceChapters();
  return <ServicesPageClient serviceChapters={serviceChapters} />;
}
