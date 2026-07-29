"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { DeferredMount } from "@/components/DeferredMount";
import { MagneticLink } from "@/components/landingAlt/MagneticLink";
import styles from "@/components/landingAlt/landingAlt.module.css";
import {
  serviceFanCards,
  servicesPageCopy,
} from "@/constants/servicesPage";
import { bindHeaderSectionSync } from "@/lib/headerSectionSync";

const CREAM_BG = "#f7f5f0";
const BRAND_BG = "#74815f";

const PROCESS_CARD_THEMES = {
  brand: {
    surface: "border-white/10 bg-brand",
    title: "text-cream",
    body: "text-cream/75",
    accent: "text-logo-gradient",
    bar: "bg-logo-gradient",
    bloom: "bg-white/10",
  },
  secondary: {
    surface: "border-black/10 bg-logo-gradient",
    title: "text-black",
    body: "text-black/70",
    accent: "text-[#2f3a28]",
    bar: "bg-[#2f3a28]",
    bloom: "bg-white/20",
  },
} as const;

const PinnedScrollFan = dynamic(
  () =>
    import("@/components/scroll/PinnedScrollFan").then((mod) => ({
      default: mod.PinnedScrollFan,
    })),
  {
    ssr: false,
    loading: () => (
      <section
        className="min-h-[100svh] w-full bg-[#0d120b]"
        aria-label="Services hero"
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

export function ServicesPageClient() {
  const processRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);

  useEffect(() => bindHeaderSectionSync(false, BRAND_BG), []);

  return (
    <main className="bg-cream text-black">
      <PinnedScrollFan
        cards={serviceFanCards}
        lead={servicesPageCopy.heroLead}
        rest={servicesPageCopy.heroRest}
        support={servicesPageCopy.heroSupport}
      />

      <DeferredMount
        rootMargin="480px 0px"
        fallback={
          <section
            id="services"
            aria-label="Our services"
            className="min-h-screen bg-[#0d120b] [content-visibility:auto] [contain-intrinsic-size:1px_100vh]"
          />
        }
      >
        <AltServices />
      </DeferredMount>

      <section
        ref={processRef}
        aria-label="Engagement process"
        data-header-tone="light"
        data-header-bg={CREAM_BG}
        className="bg-cream px-5 py-20 md:px-8 md:py-28"
      >
        <div className="relative mx-auto w-full max-w-[1360px]">
          <div className="relative mx-auto max-w-3xl text-center">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(2.4rem,8vw,5.5rem)] font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase select-none"
            >
              Process
            </span>
            <h2 className="relative z-[1] text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
              {servicesPageCopy.processTitle}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-black/55 italic">
              {servicesPageCopy.processLede}
            </p>
          </div>

          <ul className="mt-14 grid gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
            {servicesPageCopy.process.map((step) => {
              const theme = PROCESS_CARD_THEMES[step.accent];

              return (
                <li key={step.index}>
                  <article
                    className={`relative flex h-full min-h-[18rem] flex-col overflow-hidden rounded-[1.75rem] border p-7 shadow-[0_28px_60px_rgba(47,58,40,0.22)] md:min-h-[20rem] md:p-8 ${theme.surface}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -top-24 -right-16 size-48 rounded-full ${theme.bloom}`}
                    />
                    <div className="relative flex h-full flex-col">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[0.68rem] font-extrabold tracking-[0.26em] ${theme.accent}`}
                        >
                          {step.index}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`text-lg ${theme.accent}`}
                        >
                          ↗
                        </span>
                      </div>
                      <h3
                        className={`mt-8 text-[1.35rem] leading-[1.2] font-extrabold tracking-[-0.02em] italic ${theme.title}`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`mt-4 text-[0.9rem] leading-[1.55] font-medium ${theme.body}`}
                      >
                        {step.body}
                      </p>
                      <span
                        aria-hidden="true"
                        className={`mt-auto h-0.5 w-12 ${theme.bar}`}
                      />
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        ref={ctaRef}
        aria-label="Services contact CTA"
        data-header-tone="dark"
        data-header-bg={BRAND_BG}
        className={`px-5 pb-24 md:px-8 md:pb-32 ${styles.scene}`}
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
              {servicesPageCopy.ctaTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-cream/60">
              {servicesPageCopy.ctaLede}
            </p>
            <MagneticLink
              href={servicesPageCopy.ctaHref}
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-logo-gradient px-9 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-black uppercase hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none"
            >
              {servicesPageCopy.ctaLabel}
              <span aria-hidden="true">→</span>
            </MagneticLink>
          </div>
        </div>
      </section>
    </main>
  );
}
