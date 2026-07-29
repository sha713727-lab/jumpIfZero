"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { testimonials, testimonialsIntro } from "@/constants/testimonials";
import { applyHeaderTone } from "@/lib/headerTone";
import styles from "./landingAlt.module.css";

gsap.registerPlugin(ScrollTrigger);

const HEADER_HEIGHT = 72;
const SECTION_BG = "#0d120b";

const FRAME_THEMES = {
  brand: {
    frame: "border-white/10 bg-brand",
    ring: "border-cream/30",
    quote: "text-cream/85",
    name: "text-cream",
    meta: "text-logo-gradient",
  },
  secondary: {
    frame: "border-black/10 bg-logo-gradient",
    ring: "border-black/15",
    quote: "text-black/75",
    name: "text-black",
    meta: "text-[#2f3a28]",
  },
  dark: {
    frame: "border-white/10 bg-[#161c13]",
    ring: "border-cream/20",
    quote: "text-cream/80",
    name: "text-cream",
    meta: "text-logo-gradient",
  },
} as const;

const MARQUEE_ITEMS = [...testimonials, ...testimonials];

export function AltTestimonials() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const syncHeader = () => {
      const rect = section.getBoundingClientRect();

      if (rect.top > HEADER_HEIGHT || rect.bottom <= HEADER_HEIGHT) {
        return;
      }

      applyHeaderTone(false, SECTION_BG);
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", syncHeader);

    const observer = new IntersectionObserver(
      (entries) => {
        setPaused(!entries.some((entry) => entry.isIntersecting));
      },
      { rootMargin: "100px 0px", threshold: 0.05 },
    );

    observer.observe(section);

    return () => {
      window.removeEventListener("scroll", syncHeader);
      window.removeEventListener("resize", syncHeader);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;

    if (!section || !stage) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(stage, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      aria-label="Client testimonials"
      data-header-tone="dark"
      data-header-bg="#0d120b"
      className="relative overflow-x-clip bg-[#0d120b] py-28 md:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_18%_20%,rgba(116,129,95,0.28)_0%,transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_88%_78%,rgba(249,161,55,0.14)_0%,transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="hero-grain pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto w-full max-w-[1360px] px-5 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative mx-auto flex items-center justify-center py-6">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(2.4rem,8vw,5.5rem)] font-extrabold tracking-[0.08em] whitespace-nowrap text-logo-gradient opacity-25 uppercase select-none"
            >
              {testimonialsIntro.watermark}
            </span>
            <h2 className="relative z-[1] text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-cream uppercase">
              {testimonialsIntro.title}
            </h2>
          </div>

          <div className="mx-auto mt-2 max-w-xl space-y-2">
            {testimonialsIntro.lines.map((line) => (
              <p
                key={line}
                className="text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-cream/55 italic"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={stageRef}
        className={`relative mt-8 md:mt-12 ${styles.testimonialStage}`}
      >
        <div className={styles.testimonialMarqueeMask}>
          <div
            className={`${styles.testimonialMarqueeTrack} ${paused ? styles.marqueePaused : ""}`}
          >
            {MARQUEE_ITEMS.map((item, index) => {
              const theme = FRAME_THEMES[item.accent];

              return (
                <article
                  key={`${item.name}-${index}`}
                  className={`${styles.testimonialCard} ${theme.frame} relative flex items-center rounded-[1.85rem] border py-5 pr-5 pl-12 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:py-6 md:pr-6 md:pl-14`}
                >
                  <div
                    className={`absolute top-1/2 left-0 z-10 size-[5.5rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[4px] shadow-[0_10px_28px_rgba(0,0,0,0.28)] md:size-[6.25rem] ${theme.ring}`}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="100px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <p
                      className={`text-[clamp(0.92rem,1.5vw,1.05rem)] leading-[1.5] font-medium italic ${theme.quote}`}
                    >
                      “{item.quote}”
                    </p>
                    <p
                      className={`mt-4 text-[1rem] font-extrabold tracking-[-0.015em] ${theme.name}`}
                    >
                      {item.name}
                    </p>
                    <p
                      className={`mt-1.5 text-[0.62rem] font-bold tracking-[0.2em] uppercase ${theme.meta}`}
                    >
                      {item.role} · {item.company}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
