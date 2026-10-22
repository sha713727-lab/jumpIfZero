import type { Metadata } from "next";
import { AboutPageClient } from "@/components/about/AboutPageClient";
import { getSiteContact } from "@/lib/data/siteContact";
import {
  getSiteGalleryImages,
  getSitePrinciples,
} from "@/lib/data/siteSections";
import { getTeamMembers } from "@/lib/data/team";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "About | Software Team in Lahore",
  description:
    "Meet the Lahore-based team at JZ Enterprises — custom software, web, and mobile development with clear ownership from strategy through launch.",
  path: "/about",
});

export default async function AboutPage() {
  const [teamMembers, studioGallery, principles, siteContact] =
    await Promise.all([
      getTeamMembers(),
      getSiteGalleryImages("studio_flow"),
      getSitePrinciples(),
      getSiteContact(),
    ]);
  return (
    <AboutPageClient
      teamMembers={teamMembers}
      studioImages={studioGallery}
      principles={principles}
      siteContact={siteContact}
    />
  );
}
