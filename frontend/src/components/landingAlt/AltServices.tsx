"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ServiceDetailModal } from "@/components/services/ServiceDetailModal";
import { getServiceDetailBySlug } from "@/constants/serviceDetails";
import { servicesIntro } from "@/constants/servicesStory";
import type { ServiceChapter } from "@/lib/data/services";
import { applyHeaderTone } from "@/lib/headerTone";
import styles from "./landingAlt.module.css";

gsap.registerPlugin(ScrollTrigger);

type CarouselSettings = {
  readonly spread: number;
  readonly depth: number;
  readonly rotate: number;
  readonly maxRotate: number;
};

const DESKTOP_SETTINGS: CarouselSettings = {
  spread: 68,
  depth: 320,
  rotate: 27,
  maxRotate: 54,
};

const MOBILE_SETTINGS: CarouselSettings = {
  spread: 82,
  depth: 210,
  rotate: 20,
  maxRotate: 42,
};

const MOBILE_BREAKPOINT = 767;
const HEADER_HEIGHT = 72;
const SECTION_BG = "#0d120b";
const SCROLL_PER_CARD = 480;
const FADE_PER_STEP = 0.3;
const LAYER_STEP = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveSettings(width: number): CarouselSettings {
  return width <= MOBILE_BREAKPOINT ? MOBILE_SETTINGS : DESKTOP_SETTINGS;
}

function formatIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function AltServices({
  chapters,
}: Readonly<{
  chapters: readonly ServiceChapter[];
}>) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const settingsRef = useRef<CarouselSettings>(DESKTOP_SETTINGS);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const lastIndex = Math.max(chapters.length - 1, 0);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || chapters.length === 0) {
      return;
    }

    const cards = cardRefs.current.filter(
      (node): node is HTMLDivElement => node !== null,
    );

    if (cards.length === 0) {
      return;
    }

    const syncSettings = () => {
      settingsRef.current = resolveSettings(window.innerWidth);
    };

    syncSettings();
    window.addEventListener("resize", syncSettings);

    const place = (position: number) => {
      const settings = settingsRef.current;

      cards.forEach((node, index) => {
        const offset = index - position;
        const distance = Math.abs(offset);

        gsap.set(node, {
          xPercent: -50 + offset * settings.spread,
          yPercent: -50,
          z: -distance * settings.depth,
          rotateY: clamp(
            offset * -settings.rotate,
            -settings.maxRotate,
            settings.maxRotate,
          ),
          opacity: clamp(1 - distance * FADE_PER_STEP, 0, 1),
          zIndex: Math.round(
            chapters.length * LAYER_STEP - distance * LAYER_STEP,
          ),
          force3D: true,
        });
      });
    };

    const ctx = gsap.context(() => {
      place(0);

      const proxy = { position: 0 };

      const tween = gsap.to(proxy, {
        position: lastIndex,
        ease: "none",
        onUpdate: () => {
          place(proxy.position);

          const next = Math.round(proxy.position);
          if (next !== activeRef.current) {
            activeRef.current = next;
            setActive(next);
          }
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${SCROLL_PER_CARD * lastIndex}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      triggerRef.current = tween.scrollTrigger ?? null;
    }, section);

    return () => {
      window.removeEventListener("resize", syncSettings);
      triggerRef.current = null;
      ctx.revert();
    };
  }, [chapters.length, lastIndex]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const sync = () => {
      const rect = section.getBoundingClientRect();

      if (rect.top > HEADER_HEIGHT || rect.bottom <= HEADER_HEIGHT) {
        return;
      }

      applyHeaderTone(false, SECTION_BG);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const goToChapter = (index: number) => {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const ratio = lastIndex === 0 ? 0 : index / lastIndex;
    window.scrollTo({
      top: trigger.start + (trigger.end - trigger.start) * ratio,
      behavior: "smooth",
    });
  };

  const chapter = chapters[active] ?? chapters.at(0);
  const openDetail =
    detailSlug === null ? null : (getServiceDetailBySlug(detailSlug) ?? null);

  if (!chapter) {
    return null;
  }

  return (
    <>
    <section
      ref={sectionRef}
      id="services"
      aria-label="Our services"
      data-header-tone="dark"
      data-header-bg={SECTION_BG}
      className={`relative isolate min-h-[100svh] overflow-hidden bg-[#0d120b] ${styles.scene}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_74%_38%,rgba(92, 104, 73,0.26)_0%,transparent_64%)]"
      />
      <div
        aria-hidden="true"
        className="hero-grain pointer-events-none absolute inset-0"
      />

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute right-6 bottom-4 text-[clamp(7rem,17vw,15rem)] font-extrabold tracking-[-0.05em] ${styles.ghostNumber}`}
      >
        {formatIndex(active)}
      </span>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1360px] flex-col gap-8 px-5 pt-24 pb-14 md:px-8 lg:gap-10 lg:pt-24">
        <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
          <div className="relative mx-auto flex items-center justify-center py-6">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(2.4rem,8vw,5.5rem)] font-extrabold tracking-[0.08em] text-logo-gradient opacity-25 uppercase select-none"
            >
              {servicesIntro.watermark}
            </span>
            <h2 className="relative z-[1] text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-cream uppercase">
              {servicesIntro.title}
            </h2>
          </div>

          <div className="mx-auto mt-2 max-w-xl space-y-2">
            {servicesIntro.lines.map((line) => (
              <p
                key={line}
                className="text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-cream/60"
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
        <div className="relative z-10 order-2 lg:order-1">
          <div
            key={chapter.category}
            className={styles.panelSwap}
          >
            <h2 className="max-w-lg text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.035em] text-cream">
              {chapter.title}
            </h2>

            <p className="mt-5 max-w-md text-[clamp(0.95rem,1.8vw,1.08rem)] leading-[1.55] font-medium text-cream/60 italic">
              “{chapter.quote}”
            </p>

            <button
              type="button"
              onClick={() => setDetailSlug(chapter.slug)}
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-cream px-7 py-3.5 text-[0.68rem] font-extrabold tracking-[0.2em] text-black italic uppercase focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
            >
              Explore {chapter.category}
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="mt-10 flex items-center gap-2">
            {chapters.map((service, index) => (
              <button
                key={service.category}
                type="button"
                aria-label={service.category}
                aria-current={index === active}
                onClick={() => goToChapter(index)}
                className={`h-1 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none ${
                  index === active
                    ? "w-10 bg-logo-gradient"
                    : "w-4 bg-cream/20 hover:bg-cream/40"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative order-1 h-[44vh] min-h-[18rem] lg:order-2 lg:h-[70vh]">
          {chapters.map((service, index) => (
            <div
              key={service.category}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className={styles.carouselCard}
            >
              <Image
                src={service.images.left}
                alt={service.category}
                fill
                sizes="(max-width: 767px) 66vw, 28vw"
                className="object-cover"
                loading="lazy"
              />
              <span aria-hidden="true" className={styles.cardGloss} />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,14,9,0)_42%,rgba(10,14,9,0.9)_100%)]"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6">
                <p className="text-[0.66rem] font-extrabold tracking-[0.22em] text-cream uppercase">
                  {service.category}
                </p>
                <p className="text-[0.66rem] font-extrabold tracking-[0.18em] text-logo-gradient">
                  {formatIndex(index)}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>

    <ServiceDetailModal
      detail={openDetail ?? null}
      onClose={() => setDetailSlug(null)}
    />
    </>
  );
}
