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
    "Software Development Services in Lahore",
    "Custom software, web, and mobile development services from JZ Enterprises in Lahore, Pakistan.",
  );
}

export default async function ServiceChildPage({ params }: Props) {
  const { slug, childSlug } = await params;
  const path = `/services/${slug}/${childSlug}`;
  const page = await loadChildPage(slug, childSlug);
  return renderServicePage({ page, path });
}
