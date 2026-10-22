import type { Metadata } from "next";
import { PublicRouteScroll } from "@/components/layout/PublicRouteScroll";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { OrganizationWebSiteJsonLd } from "@/components/seo/OrganizationWebSiteJsonLd";

export const metadata: Metadata = {};
export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <OrganizationWebSiteJsonLd />
      <LocalBusinessJsonLd />
      <PublicRouteScroll />
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
