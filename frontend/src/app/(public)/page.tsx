import { getFaqItems } from "@/lib/data/faqs";
import { getServiceChapters } from "@/lib/data/services";
import {
  getSiteGalleryImages,
  getSiteTestimonials,
} from "@/lib/data/siteSections";
import { getTeamMembers } from "@/lib/data/team";
import { HomePageClient } from "./HomePageClient";

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
