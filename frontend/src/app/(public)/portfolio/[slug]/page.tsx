import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioDetailClient } from "@/components/portfolio/PortfolioDetailClient";
import { getPortfolioBySlug } from "@/lib/data/portfolio";

type PortfolioDetailPageProps = {
  readonly params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PortfolioDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);

  if (!item) {
    return { title: "Portfolio" };
  }

  return {
    title: item.title,
    description: item.summary,
  };
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
