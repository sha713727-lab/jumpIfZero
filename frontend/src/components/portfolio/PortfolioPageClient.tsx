"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { DeferredMount } from "@/components/DeferredMount";
import { MagneticLink } from "@/components/landingAlt/MagneticLink";
import styles from "@/components/landingAlt/landingAlt.module.css";
import {
  portfolioCopy,
  portfolioMarqueeImages,
  portfolioProjects,
} from "@/lib/data/portfolio";
import { bindHeaderSectionSync } from "@/lib/headerSectionSync";

const CREAM_BG = "#f7f5f0";
const BRAND_BG = "#74815f";
const DARK_BG = "#0d120b";

const ThreeDMarquee = dynamic(
  () =>
    import("@/components/scroll/ThreeDMarquee").then((mod) => ({
      default: mod.ThreeDMarquee,
    })),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[#0d120b]" />,
  },
);

const GsapProjectsSection = dynamic(
  () =>
    import("@/components/portfolio/GsapProjectsSection").then((mod) => ({
      default: mod.GsapProjectsSection,
    })),
  {
    loading: () => (
      <section
        className="min-h-[60vh] bg-cream [content-visibility:auto] [contain-intrinsic-size:1px_60vh]"
        aria-label="Projects"
      />
    ),
  },
);

export function PortfolioPageClient() {
  const heroRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLElement | null>(null);
  const featuredRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);

  useEffect(() => bindHeaderSectionSync(false, DARK_BG), []);

  return (
    <main className="bg-cream text-black">
      <section
        ref={heroRef}
        aria-label="Portfolio hero"
        data-header-tone="dark"
        data-header-bg={DARK_BG}
        className="relative isolate min-h-[100svh] overflow-hidden bg-[#0d120b]"
      >
        <div className="absolute inset-0 z-0">
          <ThreeDMarquee images={portfolioMarqueeImages} />
        </div>
      </section>

      <DeferredMount
        rootMargin="480px 0px"
        fallback={
          <section
            className="min-h-[60vh] bg-cream [content-visibility:auto] [contain-intrinsic-size:1px_60vh]"
            aria-label="Projects"
            data-header-tone="light"
            data-header-bg={CREAM_BG}
          />
        }
      >
        <GsapProjectsSection
          sectionRef={gridRef}
          projects={portfolioProjects}
          title={portfolioCopy.gridTitle}
          lede={portfolioCopy.gridLede}
        />
      </DeferredMount>

      <section
        ref={featuredRef}
        aria-label="Featured case"
        data-header-tone="dark"
        data-header-bg={DARK_BG}
        className={`relative overflow-hidden bg-[#0d120b] px-5 py-20 md:px-8 md:py-28 ${styles.scene}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_74%_38%,rgba(116,129,95,0.26)_0%,transparent_64%)]"
        />

        <div className="relative mx-auto grid w-full max-w-[1360px] gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#e2e4de]">
            <Image
              src={portfolioCopy.featuredImage}
              alt={portfolioCopy.featuredCategory}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
            />
          </div>

          <div>
            <p className="text-[0.66rem] font-extrabold tracking-[0.22em] text-logo-gradient uppercase">
              {portfolioCopy.featuredEyebrow}
            </p>
            <p className="mt-3 text-[0.66rem] font-extrabold tracking-[0.18em] text-cream/50 uppercase">
              {portfolioCopy.featuredCategory}
            </p>
            <h2 className="mt-4 max-w-lg text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.035em] text-cream">
              {portfolioCopy.featuredTitle}
            </h2>
            <p className="mt-5 max-w-md text-[clamp(0.95rem,1.8vw,1.08rem)] leading-[1.55] font-medium text-cream/60">
              {portfolioCopy.featuredBody}
            </p>
            <MagneticLink
              href={portfolioCopy.featuredCtaHref}
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-logo-gradient px-8 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-black uppercase hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none"
            >
              {portfolioCopy.featuredCtaLabel}
              <span aria-hidden="true">→</span>
            </MagneticLink>
          </div>
        </div>
      </section>

      <section
        ref={ctaRef}
        aria-label="Portfolio contact CTA"
        data-header-tone="dark"
        data-header-bg={BRAND_BG}
        className={`px-5 py-20 md:px-8 md:py-28 ${styles.scene}`}
      >
        <div className="relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[2.25rem] bg-brand px-6 py-16 text-center md:px-16 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(249,161,55,0.2)_0%,transparent_62%)]"
          />
          <div className="relative">
            <h2
              className={`mx-auto max-w-3xl text-[clamp(1.8rem,4.6vw,3.3rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-cream ${styles.depthText}`}
            >
              {portfolioCopy.ctaTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-cream/60">
              {portfolioCopy.ctaLede}
            </p>
            <MagneticLink
              href={portfolioCopy.ctaHref}
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-logo-gradient px-9 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-black uppercase hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none"
            >
              {portfolioCopy.ctaLabel}
              <span aria-hidden="true">→</span>
            </MagneticLink>
          </div>
        </div>
      </section>
    </main>
  );
}
