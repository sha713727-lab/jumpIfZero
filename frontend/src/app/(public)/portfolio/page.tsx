import type { Metadata } from "next";
import { getPortfolioProjects } from "@/lib/data/portfolio";
import { getSiteGalleryImages } from "@/lib/data/siteSections";
import { portfolioMarqueeImages } from "@/constants/portfolio";
import { pageMetadata } from "@/lib/pageMetadata";
import { PortfolioPageClient } from "@/components/portfolio/PortfolioPageClient";

export const metadata: Metadata = pageMetadata({
  title: "Portfolio",
  description:
    "Selected work from JZ Enterprises — websites, software, apps, brand, and growth systems built to convert and scale.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const [projects, marqueeGallery] = await Promise.all([
    getPortfolioProjects(),
    getSiteGalleryImages("portfolio_marquee"),
  ]);

  const marqueeImages =
    marqueeGallery.length > 0
      ? marqueeGallery.map((item) => item.src)
      : [...portfolioMarqueeImages];

  return (
    <PortfolioPageClient projects={projects} marqueeImages={marqueeImages} />
  );
}
