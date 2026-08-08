import type { Metadata } from "next";
import { getPortfolioProjects } from "@/lib/data/portfolio";
import { PortfolioPageClient } from "@/components/portfolio/PortfolioPageClient";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected work from JZ Enterprises — websites, software, apps, brand, and growth systems built to convert and scale.",
};

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();
  return <PortfolioPageClient projects={projects} />;
}
