import type { Metadata } from "next";
import {
  buildServicePageMetadata,
  loadChildPage,
  renderServicePage,
} from "@/lib/servicePageRender";

type Props = {
  readonly params: Promise<{
    readonly slug: string;
    readonly childSlug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, childSlug } = await params;
  const path = `/services/${slug}/${childSlug}`;
  const page = await loadChildPage(slug, childSlug);
  return buildServicePageMetadata(
    path,
    page,
    "Service",
    "Explore Jump If Zero services.",
  );
}

export default async function ServiceChildPage({ params }: Props) {
  const { slug, childSlug } = await params;
  const path = `/services/${slug}/${childSlug}`;
  const page = await loadChildPage(slug, childSlug);
  return renderServicePage({ page, path });
}
