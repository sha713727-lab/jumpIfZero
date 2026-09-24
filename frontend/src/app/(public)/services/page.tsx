import type { Metadata } from "next";
import { ServicesPageClient } from "@/components/services/ServicesPageClient";
import { serviceFanCards } from "@/constants/servicesPage";
import { getServiceChapters } from "@/lib/data/services";
import { getSiteGalleryImages } from "@/lib/data/siteSections";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Software Development Services",
  description:
    "Custom software development, web development, mobile apps, SEO, digital marketing, design, and cyber security from JZ Enterprises.",
  path: "/services",
});

export default async function ServicesPage() {
  const [serviceChapters, fanGallery] = await Promise.all([
    getServiceChapters(),
    getSiteGalleryImages("services_fan"),
  ]);

  const fanCards =
    fanGallery.length > 0
      ? fanGallery.map((item, index) => {
          const fallback = serviceFanCards[index];
          return {
            title:
              item.alt.trim().length > 0
                ? item.alt
                : (fallback?.title ?? "Service"),
            region: fallback?.region ?? "",
            image: item.src,
          };
        })
      : serviceFanCards.map((card) => ({
          title: card.title,
          region: card.region,
          image: card.image,
        }));

  return (
    <ServicesPageClient
      serviceChapters={serviceChapters}
      fanCards={fanCards}
    />
  );
}
