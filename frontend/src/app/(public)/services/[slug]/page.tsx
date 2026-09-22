import type { Metadata } from "next";
import {
  buildServicePageMetadata,
  loadPillarPage,
  renderServicePage,
} from "@/lib/servicePageRender";

type Props = {
  readonly params: Promise<{ readonly slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = `/services/${slug}`;
  const page = await loadPillarPage(slug);
  return buildServicePageMetadata(
    path,
    page,
    "Services",
    "Explore Jump If Zero services.",
  );
}

export default async function ServicePillarPage({ params }: Props) {
  const { slug } = await params;
  const path = `/services/${slug}`;
  const page = await loadPillarPage(slug);
  return renderServicePage({ page, path });
}
