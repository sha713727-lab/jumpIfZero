"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MagneticLink } from "@/components/landingAlt/MagneticLink";
import { RevealText } from "@/components/landingAlt/RevealText";
import styles from "@/components/landingAlt/landingAlt.module.css";
import {
  ServiceBreadcrumbs,
  type ServiceBreadcrumbItem,
} from "@/components/services/ServiceBreadcrumbs";
import { ServicePageFaqAccordion } from "@/components/services/customDevelopment/ServicePageFaqAccordion";
import {
  offeringImageSrc,
  offeringToServiceDetail,
} from "@/components/services/customDevelopment/offeringDetail";
import { ServiceDetailModal } from "@/components/services/ServiceDetailModal";
import type { ServiceDetail } from "@/constants/serviceDetails";
import type { PublicServicePage } from "@/lib/data/servicePages";
import { cmsMediaSrc } from "@/lib/cmsMedia";

const CREAM_BG = "#f7f5f0";
const BRAND_BG = "#5c6849";

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

const TECH_CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  commerce: "Commerce",
  database: "Database",
  cloud: "Cloud / Deployment",
};

export type RelatedCaseStudy = {
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly summary: string;
  readonly image: string;
};

export type RelatedInsight = {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly category: string;
  readonly image: string;
};

type ChildCard = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly imageSrc: string;
  readonly ctaLabel: string;
};

export function ServicePageView({
  page,
  breadcrumbs,
  caseStudies,
  insights,
}: {
  readonly page: PublicServicePage;
  readonly breadcrumbs: readonly ServiceBreadcrumbItem[];
  readonly caseStudies: readonly RelatedCaseStudy[];
  readonly insights: readonly RelatedInsight[];
}) {
  const [detail, setDetail] = useState<ServiceDetail | null>(null);
  const heroImageRef = useRef<HTMLDivElement | null>(null);
  const buildListRef = useRef<HTMLUListElement | null>(null);
  const technologiesByCategory = groupTechnologies(page.technologies);
  const childCards = resolveChildCards(page);

  useEffect(() => {
    const host = heroImageRef.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let cancelled = false;
    let ctx: { revert: () => void } | null = null;
    void (async () => {
      const { default: gsap } = await import("gsap");
      if (cancelled || !heroImageRef.current) {
        return;
      }
      ctx = gsap.context(() => {
        gsap.from(heroImageRef.current, {
          opacity: 0,
          y: 36,
          rotateX: 8,
          transformOrigin: "50% 100%",
          duration: 1.05,
          ease: "power3.out",
          delay: 0.12,
        });
      }, host);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [page.heroImageSrc]);

  useEffect(() => {
    const list = buildListRef.current;
    if (!list || page.buildItems.length === 0) {
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
      if (cancelled || !buildListRef.current) {
        return;
      }
      gsap.registerPlugin(ScrollTrigger);
      const chips = buildListRef.current.querySelectorAll("li");
      ctx = gsap.context(() => {
        gsap.from(chips, {
          opacity: 0,
          y: 14,
          duration: 0.45,
          stagger: 0.04,
          ease: "power2.out",
          scrollTrigger: {
            trigger: list,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });
      }, list);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [page.buildItems]);

  return (
    <main>
      <section
        aria-label={`${page.title} hero`}
        data-header-tone="dark"
        data-header-bg={BRAND_BG}
        className="relative overflow-hidden bg-brand px-5 pt-28 pb-20 md:px-8 md:pt-36 md:pb-28"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_85%_20%,rgba(249,161,55,0.18)_0%,transparent_55%)]"
        />
        <div className="relative mx-auto grid w-full max-w-[1360px] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
          <div>
            <ServiceBreadcrumbs items={breadcrumbs} />
            {page.heroEyebrow.trim().length > 0 ? (
              <p className="text-[0.72rem] font-extrabold tracking-[0.22em] text-cream/70 uppercase">
                {page.heroEyebrow}
              </p>
            ) : null}
            <h1 className="mt-4 max-w-3xl text-[clamp(2rem,5vw,3.6rem)] leading-[1.08] font-extrabold tracking-[-0.04em] text-cream">
              <RevealText text={page.heroH1} playOnLoad />
            </h1>
            {page.heroDescription.trim().length > 0 ? (
              <p className="mt-6 max-w-2xl text-[clamp(1rem,2vw,1.15rem)] leading-[1.6] font-medium text-cream/70">
                {page.heroDescription}
              </p>
            ) : null}
            <div className="mt-10 flex flex-wrap gap-4">
              {page.heroPrimaryCtaLabel.trim().length > 0 &&
              page.heroPrimaryCtaHref.trim().length > 0 ? (
                <MagneticLink
                  href={page.heroPrimaryCtaHref}
                  className="inline-flex items-center gap-3 rounded-full bg-logo-gradient px-8 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-black uppercase hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none"
                >
                  {page.heroPrimaryCtaLabel}
                  <span aria-hidden="true">→</span>
                </MagneticLink>
              ) : null}
              {page.heroSecondaryCtaLabel.trim().length > 0 &&
              page.heroSecondaryCtaHref.trim().length > 0 ? (
                <Link
                  href={page.heroSecondaryCtaHref}
                  className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-8 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-cream uppercase transition-colors hover:border-cream/60 focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none"
                >
                  {page.heroSecondaryCtaLabel}
                </Link>
              ) : null}
            </div>
          </div>
          {page.heroImageSrc.trim().length > 0 ? (
            <div
              ref={heroImageRef}
              className="relative aspect-[4/5] max-h-[36rem] w-full overflow-hidden rounded-[2.25rem] shadow-[0_40px_100px_rgba(13,18,11,0.45)] sm:aspect-[5/4] lg:justify-self-end"
              style={{ perspective: "1200px" }}
            >
              <Image
                src={page.heroImageSrc}
                alt={page.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 48vw"
                priority
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,18,11,0.05)_0%,rgba(13,18,11,0.45)_100%)]"
              />
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 ${styles.cardGloss}`}
              />
            </div>
          ) : null}
        </div>
      </section>

      {(page.introHeading.trim().length > 0 ||
        page.introBody.trim().length > 0) && (
        <section
          aria-label="Introduction"
          data-header-tone="light"
          data-header-bg={CREAM_BG}
          className="bg-cream px-5 py-20 md:px-8 md:py-28"
        >
          <div className="mx-auto max-w-[1360px]">
            {page.introHeading.trim().length > 0 ? (
              <h2 className="max-w-3xl text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
                <RevealText text={page.introHeading} />
              </h2>
            ) : null}
            {page.introBody.trim().length > 0 ? (
              <div className="mt-6 max-w-3xl space-y-4 text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.65] font-medium text-black/60 whitespace-pre-line">
                {page.introBody}
              </div>
            ) : null}
          </div>
        </section>
      )}

      {childCards.length > 0 ? (
        <section
          aria-label="Services"
          data-header-tone="light"
          data-header-bg={CREAM_BG}
          className="bg-cream px-5 pb-20 md:px-8 md:pb-28"
        >
          <div className="mx-auto max-w-[1360px]">
            {page.offeringsHeading.trim().length > 0 ? (
              <h2 className="text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
                <RevealText text={page.offeringsHeading} />
              </h2>
            ) : null}
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {childCards.map((card) => (
                <li key={card.id}>
                  {card.href.startsWith("/services/") &&
                  !card.href.includes("undefined") ? (
                    <Link
                      href={card.href}
                      className="group relative block w-full overflow-hidden rounded-[1.75rem] text-left shadow-[0_28px_70px_rgba(47,58,40,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    >
                      <ChildCardMedia card={card} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setDetail(
                          offeringToServiceDetail({
                            title: card.title,
                            description: card.description,
                            imagePath: card.imageSrc,
                          }),
                        )
                      }
                      className="group relative block w-full overflow-hidden rounded-[1.75rem] text-left shadow-[0_28px_70px_rgba(47,58,40,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    >
                      <ChildCardMedia card={card} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {page.capabilities.length > 0 ? (
        <TitledItemsSection
          ariaLabel="Capabilities"
          heading={page.capabilitiesHeading}
          intro={page.capabilitiesIntro}
          items={page.capabilities.map((item) => ({
            id: item.id,
            title: item.title,
            body: item.body,
          }))}
          tone="cream"
        />
      ) : null}

      {page.problems.length > 0 ? (
        <TitledItemsSection
          ariaLabel="Problems and use cases"
          heading={page.problemsHeading}
          intro={page.problemsIntro}
          items={page.problems.map((item) => ({
            id: item.id,
            title: item.title,
            body: item.body,
          }))}
          tone="brand"
        />
      ) : null}

      {page.buildItems.length > 0 ? (
        <section
          aria-label="What we can build"
          data-header-tone="dark"
          data-header-bg={BRAND_BG}
          className="bg-brand px-5 py-20 md:px-8 md:py-28"
        >
          <div className="mx-auto max-w-[1360px]">
            {page.buildHeading.trim().length > 0 ? (
              <h2 className="text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-cream uppercase">
                <RevealText text={page.buildHeading} />
              </h2>
            ) : null}
            <ul ref={buildListRef} className="mt-10 flex flex-wrap gap-3">
              {page.buildItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-full border border-cream/20 px-4 py-2 text-[0.82rem] font-semibold text-cream/90"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {page.processSteps.length > 0 ? (
        <section
          aria-label="Process"
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
              {page.processHeading.trim().length > 0 ? (
                <h2 className="relative z-[1] text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
                  <RevealText text={page.processHeading} />
                </h2>
              ) : null}
            </div>
            <ul className="mt-14 grid gap-5 md:mt-16 md:grid-cols-2 xl:grid-cols-3 md:gap-6">
              {page.processSteps.map((step, index) => {
                const theme =
                  PROCESS_CARD_THEMES[
                    index % 2 === 0 ? "brand" : "secondary"
                  ];
                return (
                  <li key={step.id}>
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
                            {String(step.step_number).padStart(2, "0")}
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
                        {step.body.trim().length > 0 ? (
                          <p
                            className={`mt-4 text-[0.9rem] leading-[1.55] font-medium ${theme.body}`}
                          >
                            {step.body}
                          </p>
                        ) : null}
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
      ) : null}

      {(page.comparisonHeading.trim().length > 0 ||
        page.comparisonBody.trim().length > 0 ||
        page.comparisonPoints.length > 0) && (
        <section
          aria-label="Comparison"
          data-header-tone="light"
          data-header-bg={CREAM_BG}
          className="bg-cream px-5 pb-20 md:px-8 md:pb-28"
        >
          <div className="mx-auto max-w-[1360px]">
            {page.comparisonHeading.trim().length > 0 ? (
              <h2 className="text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
                <RevealText text={page.comparisonHeading} />
              </h2>
            ) : null}
            {page.comparisonBody.trim().length > 0 ? (
              <p className="mt-5 max-w-3xl text-[1.05rem] leading-[1.6] font-medium text-black/60 whitespace-pre-line">
                {page.comparisonBody}
              </p>
            ) : null}
            {page.comparisonPoints.length > 0 ? (
              <ul className="mt-12 grid gap-8 md:grid-cols-2">
                {page.comparisonPoints.map((item) => (
                  <li
                    key={item.id}
                    className="border-t border-black/12 pt-5"
                  >
                    <h3 className="text-[1.15rem] font-extrabold tracking-[-0.02em] text-black">
                      {item.title}
                    </h3>
                    {item.body.trim().length > 0 ? (
                      <p className="mt-3 text-[0.92rem] leading-[1.55] font-medium text-black/55">
                        {item.body}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      )}

      {technologiesByCategory.length > 0 ? (
        <section
          aria-label="Technologies"
          data-header-tone="light"
          data-header-bg={CREAM_BG}
          className="bg-cream px-5 pb-20 md:px-8 md:pb-28"
        >
          <div className="mx-auto max-w-[1360px]">
            {page.technologiesHeading.trim().length > 0 ? (
              <h2 className="text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
                {page.technologiesHeading}
              </h2>
            ) : null}
            <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {technologiesByCategory.map((group) => (
                <div key={group.category}>
                  <h3 className="text-[0.72rem] font-extrabold tracking-[0.18em] text-[#5c3d18] uppercase">
                    {group.label}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {group.items.map((item) => (
                      <li
                        key={item.id}
                        className="text-[0.95rem] font-medium text-black/70"
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {page.benefits.length > 0 ? (
        <TitledItemsSection
          ariaLabel="Benefits"
          heading={page.benefitsHeading}
          intro={page.benefitsIntro}
          items={page.benefits.map((item) => ({
            id: item.id,
            title: item.title,
            body: item.body,
          }))}
          tone="brand"
        />
      ) : null}

      {caseStudies.length > 0 ? (
        <section
          aria-label="Related work"
          data-header-tone="light"
          data-header-bg={CREAM_BG}
          className="bg-cream px-5 py-20 md:px-8 md:py-28"
        >
          <div className="mx-auto max-w-[1360px]">
            <h2 className="text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
              <RevealText text="Selected work" />
            </h2>
            <ul className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {caseStudies.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/portfolio/${item.slug}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    {item.image.trim().length > 0 ? (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_rgba(47,58,40,0.16)]">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,18,11,0)_35%,rgba(13,18,11,0.55)_100%)]"
                        />
                        <p className="absolute bottom-4 left-4 text-[0.66rem] font-extrabold tracking-[0.18em] text-logo-gradient uppercase">
                          {item.category}
                        </p>
                      </div>
                    ) : null}
                    <h3 className="mt-4 text-[1.15rem] font-extrabold tracking-[-0.02em] text-black">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.9rem] leading-[1.5] font-medium text-black/55">
                      {item.summary}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {page.related.length > 0 ? (
        <section
          aria-label="Related services"
          data-header-tone="light"
          data-header-bg={CREAM_BG}
          className="bg-cream px-5 py-14 md:px-8 md:py-16"
        >
          <div className="mx-auto max-w-[1360px]">
            <h2 className="text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
              Related services
            </h2>
            <ul
              className={
                page.related.length === 1
                  ? "mt-8 grid max-w-2xl gap-4"
                  : page.related.length === 2
                    ? "mt-8 grid max-w-4xl gap-4 md:grid-cols-2"
                    : "mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              }
            >
              {page.related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.page.href}
                    className="flex h-full flex-col border-t border-black/12 pt-5 transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    <h3 className="text-[1.1rem] font-extrabold tracking-[-0.02em] text-black">
                      {item.page.title}
                    </h3>
                    {item.page.heroDescription.trim().length > 0 ? (
                      <p className="mt-2 line-clamp-3 text-[0.9rem] leading-[1.5] font-medium text-black/55">
                        {item.page.heroDescription}
                      </p>
                    ) : null}
                    <span className="mt-4 text-[0.68rem] font-extrabold tracking-[0.16em] text-brand uppercase">
                      Learn more →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {insights.length > 0 ? (
        <section
          aria-label="Related insights"
          data-header-tone="light"
          data-header-bg={CREAM_BG}
          className="bg-cream px-5 py-14 md:px-8 md:py-16"
        >
          <div className="mx-auto max-w-[1360px]">
            <h2 className="text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
              Related insights
            </h2>
            <ul
              className={
                insights.length === 1
                  ? "mt-8 grid max-w-2xl gap-8"
                  : insights.length === 2
                    ? "mt-8 grid max-w-4xl gap-8 md:grid-cols-2"
                    : "mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3"
              }
            >
              {insights.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    {item.image.trim().length > 0 ? (
                      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem]">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ) : null}
                    <p className="mt-4 text-[0.7rem] font-extrabold tracking-[0.16em] text-[#5c3d18] uppercase">
                      {item.category}
                    </p>
                    <h3 className="mt-2 text-[1.1rem] font-extrabold tracking-[-0.02em] text-black">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.9rem] leading-[1.5] font-medium text-black/55">
                      {item.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ServicePageFaqAccordion
        heading={
          page.faqsHeading.trim().length > 0
            ? page.faqsHeading
            : "Frequently Asked Questions"
        }
        items={page.faqs.map((faq) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
        }))}
      />

      {(page.ctaHeading.trim().length > 0 ||
        page.ctaLabel.trim().length > 0) && (
        <section
          aria-label="Contact CTA"
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
              {page.ctaHeading.trim().length > 0 ? (
                <h2
                  className={`mx-auto max-w-3xl text-[clamp(1.8rem,4.6vw,3.3rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-cream ${styles.depthText}`}
                >
                  {page.ctaHeading}
                </h2>
              ) : null}
              {page.ctaBody.trim().length > 0 ? (
                <p className="mx-auto mt-5 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-cream/60">
                  {page.ctaBody}
                </p>
              ) : null}
              {page.ctaLabel.trim().length > 0 &&
              page.ctaHref.trim().length > 0 ? (
                <MagneticLink
                  href={page.ctaHref}
                  className="mt-10 inline-flex items-center gap-3 rounded-full bg-logo-gradient px-9 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-black uppercase hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none"
                >
                  {page.ctaLabel}
                  <span aria-hidden="true">→</span>
                </MagneticLink>
              ) : null}
            </div>
          </div>
        </section>
      )}

      <ServiceDetailModal detail={detail} onClose={() => setDetail(null)} />
    </main>
  );
}

function ChildCardMedia({ card }: { readonly card: ChildCard }) {
  return (
    <div className="relative aspect-[3/4]">
      {card.imageSrc.trim().length > 0 ? (
        <Image
          src={card.imageSrc}
          alt={card.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-[#2f3a28]" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,18,11,0.05)_20%,rgba(13,18,11,0.78)_100%)]"
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${styles.cardGloss}`}
      />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <h3 className="text-[1.2rem] leading-[1.2] font-extrabold tracking-[-0.02em] text-cream">
          {card.title}
        </h3>
        {card.description.trim().length > 0 ? (
          <p className="mt-2 line-clamp-3 text-[0.88rem] leading-[1.5] font-medium text-cream/70">
            {card.description}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-2 text-[0.68rem] font-extrabold tracking-[0.18em] text-logo-gradient uppercase">
          {card.ctaLabel}
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </div>
  );
}

function TitledItemsSection({
  ariaLabel,
  heading,
  intro,
  items,
  tone,
}: {
  readonly ariaLabel: string;
  readonly heading: string;
  readonly intro: string;
  readonly items: readonly {
    readonly id: string;
    readonly title: string;
    readonly body: string;
  }[];
  readonly tone: "cream" | "brand";
}) {
  const isBrand = tone === "brand";
  return (
    <section
      aria-label={ariaLabel}
      data-header-tone={isBrand ? "dark" : "light"}
      data-header-bg={isBrand ? BRAND_BG : CREAM_BG}
      className={`${isBrand ? "bg-brand" : "bg-cream"} px-5 py-20 md:px-8 md:py-28`}
    >
      <div className="mx-auto max-w-[1360px]">
        {heading.trim().length > 0 ? (
          <h2
            className={`text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] uppercase ${isBrand ? "text-cream" : "text-black"}`}
          >
            <RevealText text={heading} />
          </h2>
        ) : null}
        {intro.trim().length > 0 ? (
          <p
            className={`mt-5 max-w-3xl text-[1.05rem] leading-[1.6] font-medium ${isBrand ? "text-cream/70" : "text-black/60"}`}
          >
            {intro}
          </p>
        ) : null}
        <ul className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={`border-t pt-5 ${isBrand ? "border-cream/20" : "border-black/12"}`}
            >
              <h3
                className={`text-[1.15rem] font-extrabold tracking-[-0.02em] ${isBrand ? "text-cream" : "text-black"}`}
              >
                {item.title}
              </h3>
              {item.body.trim().length > 0 ? (
                <p
                  className={`mt-3 text-[0.92rem] leading-[1.55] font-medium ${isBrand ? "text-cream/65" : "text-black/55"}`}
                >
                  {item.body}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function resolveChildCards(page: PublicServicePage): readonly ChildCard[] {
  if (page.children.length > 0) {
    return page.children.map((child) => ({
      id: child.id,
      title: child.title,
      description: child.heroDescription,
      href: child.href,
      imageSrc: cmsMediaSrc(child.heroImagePath),
      ctaLabel: "Explore",
    }));
  }

  return page.offerings.map((offering) => ({
    id: offering.id,
    title: offering.title,
    description: offering.description,
    href: offering.cta_href,
    imageSrc: offeringImageSrc(offering.title, offering.image_path),
    ctaLabel:
      offering.cta_label.trim().length > 0
        ? offering.cta_label
        : "View details",
  }));
}

function groupTechnologies(
  items: PublicServicePage["technologies"],
): readonly {
  readonly category: string;
  readonly label: string;
  readonly items: PublicServicePage["technologies"];
}[] {
  const order = [
    "frontend",
    "backend",
    "mobile",
    "commerce",
    "database",
    "cloud",
  ] as const;
  return order
    .map((category) => {
      const groupItems = items.filter((item) => item.category === category);
      return {
        category,
        label: TECH_CATEGORY_LABELS[category] ?? category,
        items: groupItems,
      };
    })
    .filter((group) => group.items.length > 0);
}
