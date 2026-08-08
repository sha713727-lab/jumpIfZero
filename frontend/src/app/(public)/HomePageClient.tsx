"use client";

import dynamic from "next/dynamic";
import { DeferredMount } from "@/components/DeferredMount";

const HeroScrollStory = dynamic(
  () =>
    import("@/components/home/HeroScrollStory").then((mod) => ({
      default: mod.HeroScrollStory,
    })),
  {
    loading: () => (
      <section
        className="min-h-screen bg-cream"
        aria-label="JZ Enterprises introduction"
      />
    ),
  },
);

const AltServices = dynamic(
  () =>
    import("@/components/landingAlt/AltServices").then((mod) => ({
      default: mod.AltServices,
    })),
  {
    loading: () => (
      <section
        id="services"
        aria-label="Our services"
        className="min-h-screen bg-[#0d120b]"
      />
    ),
  },
);

const AltWhy = dynamic(
  () =>
    import("@/components/landingAlt/AltWhy").then((mod) => ({
      default: mod.AltWhy,
    })),
  {
    loading: () => <section className="min-h-[40vh] bg-[#f7f5f0]" />,
  },
);

const FloatingGallery = dynamic(
  () =>
    import("@/components/FloatingGallery/FloatingGallery").then((mod) => ({
      default: mod.FloatingGallery,
    })),
  {
    ssr: false,
    loading: () => (
      <section
        id="about"
        aria-label="About JZ Enterprises"
        className="min-h-screen bg-[#f3f5ef]"
      />
    ),
  },
);

const AltMarquee = dynamic(
  () =>
    import("@/components/landingAlt/AltMarquee").then((mod) => ({
      default: mod.AltMarquee,
    })),
  {
    loading: () => <section className="min-h-[14rem] bg-brand" />,
  },
);

const AltTestimonials = dynamic(
  () =>
    import("@/components/landingAlt/AltTestimonials").then((mod) => ({
      default: mod.AltTestimonials,
    })),
  {
    loading: () => (
      <section
        id="testimonials"
        aria-label="Client testimonials"
        className="min-h-[50vh] bg-[#0d120b]"
      />
    ),
  },
);

const AltTeam = dynamic(
  () =>
    import("@/components/landingAlt/AltTeam").then((mod) => ({
      default: mod.AltTeam,
    })),
  {
    loading: () => (
      <section
        id="team"
        aria-label="Our team"
        className="min-h-[50vh] bg-[#f7f5f0]"
      />
    ),
  },
);

const AltFaq = dynamic(
  () =>
    import("@/components/landingAlt/AltFaq").then((mod) => ({
      default: mod.AltFaq,
    })),
  {
    loading: () => (
      <section
        id="faq"
        aria-label="Frequently asked questions"
        className="min-h-[50vh] bg-[#f7f5f0]"
      />
    ),
  },
);

const AltContact = dynamic(
  () =>
    import("@/components/landingAlt/AltContact").then((mod) => ({
      default: mod.AltContact,
    })),
  {
    loading: () => (
      <section
        aria-label="Contact JZ Enterprises"
        className="min-h-[40vh] bg-[#f7f5f0]"
      />
    ),
  },
);

const ScrollFrameSequence = dynamic(
  () =>
    import("@/components/ScrollFrameSequence").then((mod) => ({
      default: mod.ScrollFrameSequence,
    })),
  {
    ssr: false,
    loading: () => (
      <section
        id="home"
        className="h-screen w-full bg-[#2f3a28]"
        aria-label="JZ Enterprises"
      />
    ),
  },
);

import type { FaqItem } from "@/lib/data/faqs";
import type { ServiceChapter } from "@/lib/data/services";
import type { SiteTestimonial } from "@/lib/data/siteSections";
import type { TeamMember } from "@/lib/data/team";

export function HomePageClient({
  serviceChapters,
  teamMembers,
  faqItems,
  aboutGalleryImages,
  testimonials,
}: Readonly<{
  serviceChapters: readonly ServiceChapter[];
  teamMembers: readonly TeamMember[];
  faqItems: readonly FaqItem[];
  aboutGalleryImages: readonly string[];
  testimonials: readonly SiteTestimonial[];
}>) {
  return (
    <main>
      <ScrollFrameSequence />
      <HeroScrollStory />
      <DeferredMount
        fallback={
          <section
            id="services"
            aria-label="Our services"
            className="min-h-screen bg-[#0d120b] [content-visibility:auto] [contain-intrinsic-size:1px_100vh]"
          />
        }
      >
        <AltServices chapters={serviceChapters} />
      </DeferredMount>
      <DeferredMount
        fallback={
          <section className="min-h-[40vh] bg-[#f7f5f0] [content-visibility:auto] [contain-intrinsic-size:1px_40vh]" />
        }
      >
        <AltWhy />
      </DeferredMount>
      <DeferredMount
        fallback={
          <section
            id="about"
            aria-label="About JZ Enterprises"
            className="min-h-screen bg-[#f3f5ef] [content-visibility:auto] [contain-intrinsic-size:1px_100vh]"
          />
        }
      >
        <FloatingGallery imagePaths={aboutGalleryImages} />
      </DeferredMount>
      <DeferredMount
        fallback={
          <section className="min-h-[14rem] bg-brand [content-visibility:auto] [contain-intrinsic-size:1px_14rem]" />
        }
      >
        <AltMarquee />
      </DeferredMount>
      <DeferredMount
        fallback={
          <section
            id="testimonials"
            aria-label="Client testimonials"
            className="min-h-[50vh] bg-[#0d120b] [content-visibility:auto] [contain-intrinsic-size:1px_50vh]"
          />
        }
      >
        <AltTestimonials items={testimonials} />
      </DeferredMount>
      <DeferredMount
        fallback={
          <section
            id="team"
            aria-label="Our team"
            className="min-h-[50vh] bg-[#f7f5f0] [content-visibility:auto] [contain-intrinsic-size:1px_50vh]"
          />
        }
      >
        <AltTeam members={teamMembers} />
      </DeferredMount>
      <DeferredMount
        fallback={
          <section
            id="faq"
            aria-label="Frequently asked questions"
            className="min-h-[50vh] bg-[#f7f5f0] [content-visibility:auto] [contain-intrinsic-size:1px_50vh]"
          />
        }
      >
        <AltFaq items={faqItems} />
      </DeferredMount>
      <DeferredMount
        fallback={
          <section
            aria-label="Contact JZ Enterprises"
            className="min-h-[40vh] bg-[#f7f5f0] [content-visibility:auto] [contain-intrinsic-size:1px_40vh]"
          />
        }
      >
        <AltContact />
      </DeferredMount>
    </main>
  );
}
