import type { Metadata } from "next";
import {
  buildServicePageMetadata,
  loadPillarPage,
  renderServicePage,
} from "@/lib/servicePageRender";

const SLUG = "custom-development";
const PATH = `/services/${SLUG}`;

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadPillarPage(SLUG);
  return buildServicePageMetadata(
    PATH,
    page,
    "Custom Development",
    "Custom websites, web apps, mobile apps, and software solutions from JZ Enterprises.",
  );
}

export default async function CustomDevelopmentPage() {
  const page = await loadPillarPage(SLUG);
  return renderServicePage({ page, path: PATH });
}
