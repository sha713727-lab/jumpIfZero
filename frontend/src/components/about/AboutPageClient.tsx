"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { DeferredMount } from "@/components/DeferredMount";
import { MagneticLink } from "@/components/landingAlt/MagneticLink";
import { RevealText } from "@/components/landingAlt/RevealText";
import { aboutCopy } from "@/constants/about";
import { bindHeaderSectionSync } from "@/lib/headerSectionSync";
import styles from "@/components/landingAlt/landingAlt.module.css";

const HERO_BG = "#5c6849";
const CREAM_BG = "#f7f5f0";

const AboutBelowFold = dynamic(
  () =>
    import("@/components/about/AboutBelowFold").then((mod) => ({
      default: mod.AboutBelowFold,
    })),
  {
    loading: () => (
      <section
        className="min-h-[80vh] bg-cream [content-visibility:auto] [contain-intrinsic-size:1px_80vh]"
        aria-hidden="true"
      />
    ),
  },
);

export function AboutPageClient({
  teamMembers,
  studioImages,
  principles,
  siteContact,
}: Readonly<{
  teamMembers: readonly import("@/lib/data/team").TeamMember[];
  studioImages: readonly string[];
  principles: readonly import("@/lib/data/siteSections").SitePrinciple[];
  siteContact: import("@/lib/data/siteContact").SiteContactDetails;
}>) {
  const heroRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);
  const locationRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const storyCopyRef = useRef<HTMLDivElement | null>(null);
  const ctaPanelRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => bindHeaderSectionSync(false, HERO_BG), []);

  useEffect(() => {
    const panel = panelRef.current;
    const story = storyCopyRef.current;
    const ctaPanel = ctaPanelRef.current;

    if (!panel || !mainRef.current) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    let ctx: { revert: () => void } | null = null;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled || !mainRef.current) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          panel,
          { rotateX: 14, z: -280, opacity: 0.25 },
          {
            rotateX: 0,
            z: 0,
            opacity: 1,
            ease: "power3.out",
            duration: 1.1,
          },
        );

        if (story) {
          gsap.fromTo(
            story.querySelectorAll("[data-reveal]"),
            { y: 28, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: story,
                start: "top 82%",
                end: "top 48%",
                scrub: 0.7,
              },
            },
          );
        }

        if (ctaPanel) {
          gsap.fromTo(
            ctaPanel,
            { rotateX: 16, z: -240, opacity: 0.2 },
            {
              rotateX: 0,
              z: 0,
              opacity: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: ctaRef.current,
                start: "top 88%",
                end: "top 45%",
                scrub: 0.8,
              },
            },
          );
        }
      }, mainRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <main ref={mainRef} className="bg-cream">
      <section
        ref={heroRef}
        aria-label="About hero"
        data-header-tone="dark"
        data-header-bg={HERO_BG}
        className={`px-5 pt-28 pb-8 md:px-8 md:pt-32 md:pb-10 ${styles.scene}`}
      >
        <div
          ref={panelRef}
          className="relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[2.25rem] bg-brand px-6 py-16 text-center [transform-style:preserve-3d] md:px-16 md:py-24"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(247,245,240,0.18)_0%,transparent_62%)]"
          />

          <div className="relative">
            <Image
              src="/images/jumpIfZeroLogo.png"
              alt=""
              aria-hidden="true"
              width={54}
              height={52}
              className="mx-auto h-12 w-auto"
            />

            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-16 select-none text-[clamp(2.4rem,8vw,5.5rem)] leading-none font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase md:top-20"
            >
              {aboutCopy.watermark}
            </p>

            <h1
              className={`relative mx-auto mt-9 max-w-3xl text-[clamp(1.8rem,4.6vw,3.3rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-cream ${styles.depthText}`}
            >
              <RevealText text={aboutCopy.title} playOnLoad />
            </h1>

            <p className="relative mx-auto mt-6 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-cream/60">
              {aboutCopy.lede}
            </p>

            <p className="relative mx-auto mt-5 text-[0.7rem] font-extrabold tracking-[0.2em] text-cream/70 uppercase">
              {aboutCopy.micro}
            </p>
          </div>
        </div>
      </section>

      <section
        ref={storyRef}
        aria-label="Who we are"
        data-header-tone="light"
        data-header-bg={CREAM_BG}
        className="px-5 pt-10 pb-6 md:px-8 md:pt-16 md:pb-10"
      >
        <div
          ref={storyCopyRef}
          className="mx-auto grid w-full max-w-[1360px] gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-14 md:items-start"
        >
          <div data-reveal>
            <p className="text-[0.7rem] font-extrabold tracking-[0.22em] text-black/45 uppercase">
              Story
            </p>
            <h2 className="mt-4 text-[clamp(1.55rem,3.4vw,2.55rem)] font-extrabold tracking-[-0.02em] text-black uppercase">
              {aboutCopy.storyTitle}
            </h2>
          </div>
          <div className="space-y-5">
            {aboutCopy.story.map((paragraph) => (
              <p
                key={paragraph}
                data-reveal
                className="text-[0.95rem] leading-[1.7] font-medium text-black/55 md:text-[1.02rem]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <DeferredMount
        rootMargin="480px 0px"
        fallback={
          <section
            className="min-h-[80vh] bg-cream [content-visibility:auto] [contain-intrinsic-size:1px_80vh]"
            aria-hidden="true"
          />
        }
      >
        <AboutBelowFold
          members={teamMembers}
          studioImages={studioImages}
          principles={principles}
        />
      </DeferredMount>

      <section
        ref={locationRef}
        aria-label="Location"
        data-header-tone="light"
        data-header-bg={CREAM_BG}
        className="px-5 py-16 md:px-8 md:py-24"
      >
        <div className="mx-auto mb-10 w-full max-w-[1360px] md:mb-14">
          <div className="relative max-w-2xl">
            <p
              aria-hidden="true"
              className="pointer-events-none absolute -top-6 left-0 select-none text-[clamp(2.4rem,8vw,5.5rem)] leading-none font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase"
            >
              {aboutCopy.locationWatermark}
            </p>
            <p className="relative text-[0.7rem] font-extrabold tracking-[0.22em] text-logo-gradient uppercase">
              {siteContact.addressLabel || aboutCopy.location.label}
            </p>
            <div
              aria-hidden="true"
              className="relative mt-4 h-1.5 w-14 rounded-full bg-logo-gradient"
            />
            <h2 className="relative mt-5 text-[clamp(1.55rem,3.4vw,2.55rem)] font-extrabold tracking-[-0.02em] text-brand uppercase">
              {aboutCopy.locationTitle}
            </h2>
            <p className="relative mt-4 max-w-md text-[0.95rem] leading-[1.65] font-medium text-[#2f3a28]/80">
              {siteContact.locationLede}
            </p>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-[1360px] gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          <div className="relative min-h-[22rem] overflow-hidden rounded-[1.75rem] shadow-[0_18px_40px_rgba(47,58,40,0.12)] ring-4 ring-brand/25 md:min-h-[28rem]">
            <iframe
              title="JZ Enterprises studio location"
              src={siteContact.mapEmbedUrl}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-8 md:gap-10">
            <div>
              <p className="text-[0.7rem] font-extrabold tracking-[0.2em] text-brand uppercase">
                {aboutCopy.location.emailLabel}
              </p>
              <a
                href={`mailto:${siteContact.email}`}
                className="mt-2 inline-block text-[clamp(1.05rem,2vw,1.35rem)] font-extrabold tracking-[-0.02em] text-logo-gradient transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
              >
                {siteContact.email}
              </a>
            </div>

            <div>
              <p className="text-[0.7rem] font-extrabold tracking-[0.2em] text-brand uppercase">
                {aboutCopy.location.phoneLabel}
              </p>
              <a
                href={siteContact.phoneHref}
                className="mt-2 inline-block text-[clamp(1.05rem,2vw,1.35rem)] font-extrabold tracking-[-0.02em] text-[#2f3a28] transition-colors hover:text-logo-gradient focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
              >
                {siteContact.phone}
              </a>
            </div>

            <address className="not-italic text-[0.9rem] leading-[1.65] font-medium text-brand/80">
              {siteContact.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

            <MagneticLink
              href={aboutCopy.location.ctaHref}
              className="inline-flex w-fit items-center gap-3 rounded-full bg-logo-gradient px-9 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-black uppercase hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              {aboutCopy.location.ctaLabel}
              <span aria-hidden="true">→</span>
            </MagneticLink>
          </div>
        </div>
      </section>

      <section
        ref={ctaRef}
        aria-label="About contact CTA"
        data-header-tone="dark"
        data-header-bg={HERO_BG}
        className={`px-5 pb-24 md:px-8 md:pb-32 ${styles.scene}`}
      >
        <div
          ref={ctaPanelRef}
          className="relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[2.25rem] bg-brand px-6 py-16 text-center [transform-style:preserve-3d] md:px-16 md:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(249,161,55,0.2)_0%,transparent_62%)]"
          />
          <div className="relative">
            <h2
              className={`mx-auto max-w-3xl text-[clamp(1.8rem,4.6vw,3.3rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-cream ${styles.depthText}`}
            >
              {aboutCopy.ctaTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-cream/60">
              {aboutCopy.ctaLede}
            </p>
            <MagneticLink
              href={aboutCopy.ctaHref}
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-logo-gradient px-9 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-black uppercase hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none"
            >
              {aboutCopy.ctaLabel}
              <span aria-hidden="true">→</span>
            </MagneticLink>
          </div>
        </div>
      </section>
    </main>
  );
}
