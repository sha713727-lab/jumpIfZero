import type { Metadata } from "next";
import { getPortfolioProjects } from "@/lib/data/portfolio";
import { pageMetadata } from "@/lib/pageMetadata";
import { PortfolioPageClient } from "@/components/portfolio/PortfolioPageClient";

export const metadata: Metadata = pageMetadata({
  title: "Portfolio",
  description:
    "Selected work from JZ Enterprises — websites, software, apps, brand, and growth systems built to convert and scale.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();
  return <PortfolioPageClient projects={projects} />;
}
