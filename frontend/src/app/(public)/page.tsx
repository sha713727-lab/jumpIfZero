import type { Metadata } from "next";
import { getFaqItems } from "@/lib/data/faqs";
import { getServiceChapters } from "@/lib/data/services";
import {
  getSiteGalleryImages,
  getSiteTestimonials,
} from "@/lib/data/siteSections";
import { getTeamMembers } from "@/lib/data/team";
import { env } from "@/lib/env";
import { site } from "@/constants/site";
import { HomePageClient } from "./HomePageClient";

const homeTitle = `${site.name} | ${site.tagline}`;

export const metadata: Metadata = {
  title: {
    absolute: homeTitle,
  },
  description: site.description,
  alternates: {
    canonical: env.siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: env.siteUrl,
    siteName: site.name,
    title: homeTitle,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: site.description,
  },
};

export const revalidate = 60;

export default async function HomePage() {
  const [
    serviceChapters,
    teamMembers,
    faqItems,
    aboutGallery,
    testimonials,
  ] = await Promise.all([
    getServiceChapters(),
    getTeamMembers(),
    getFaqItems(),
    getSiteGalleryImages("about_gallery"),
    getSiteTestimonials(),
  ]);

  return (
    <HomePageClient
      serviceChapters={serviceChapters}
      teamMembers={teamMembers}
      faqItems={faqItems}
      aboutGalleryImages={aboutGallery.map((item) => item.src)}
      testimonials={testimonials}
    />
  );
}
