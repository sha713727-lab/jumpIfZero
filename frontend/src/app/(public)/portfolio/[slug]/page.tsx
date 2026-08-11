import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioDetailClient } from "@/components/portfolio/PortfolioDetailClient";
import { getPortfolioBySlug } from "@/lib/data/portfolio";
import { pageMetadata } from "@/lib/pageMetadata";

type PortfolioDetailPageProps = {
  readonly params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PortfolioDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);

  if (!item) {
    return pageMetadata({
      title: "Portfolio",
      description:
        "Selected work from JZ Enterprises — websites, software, apps, brand, and growth systems.",
      path: "/portfolio",
    });
  }

  return pageMetadata({
    title: item.title,
    description: item.summary,
    path: `/portfolio/${item.slug}`,
  });
}

export default async function PortfolioDetailPage({
  params,
}: PortfolioDetailPageProps) {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);

  if (!item) {
    notFound();
  }

  return <PortfolioDetailClient item={item} />;
}
