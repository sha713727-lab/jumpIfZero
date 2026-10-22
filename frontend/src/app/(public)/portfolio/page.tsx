import type { Metadata } from "next";
import { getPortfolioProjects } from "@/lib/data/portfolio";
import { getSiteGalleryImages } from "@/lib/data/siteSections";
import { portfolioMarqueeImages } from "@/constants/portfolio";
import { pageMetadata } from "@/lib/pageMetadata";
import { PortfolioPageClient } from "@/components/portfolio/PortfolioPageClient";

export const metadata: Metadata = pageMetadata({
  title: "Portfolio | Web, Software & App Projects",
  description:
    "Selected websites, software, and mobile apps built by JZ Enterprises for businesses in Pakistan and beyond — outcomes you can review before you engage.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const [projects, marqueeGallery] = await Promise.all([
    getPortfolioProjects(),
    getSiteGalleryImages("portfolio_marquee"),
  ]);

  const marqueeImages =
    marqueeGallery.length > 0
      ? marqueeGallery
      : portfolioMarqueeImages.map((src) => ({
          src,
          alt: "JZ Enterprises portfolio project",
        }));

  return (
    <PortfolioPageClient projects={projects} marqueeImages={marqueeImages} />
  );
}
