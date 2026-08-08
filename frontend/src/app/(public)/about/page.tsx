import type { Metadata } from "next";
import { AboutPageClient } from "@/components/about/AboutPageClient";
import { getSiteContact } from "@/lib/data/siteContact";
import {
  getSiteGalleryImages,
  getSitePrinciples,
} from "@/lib/data/siteSections";
import { getTeamMembers } from "@/lib/data/team";

export const metadata: Metadata = {
  title: "About",
  description:
    "JZ Enterprises designs end-to-end digital systems around your goals — strategy, design, development, and growth as one system.",
};

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
      studioImages={studioGallery.map((item) => item.src)}
      principles={principles}
      siteContact={siteContact}
    />
  );
}
