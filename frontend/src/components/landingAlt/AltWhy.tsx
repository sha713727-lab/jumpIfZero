"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whyChoose } from "@/constants/whyChoose";
import { applyHeaderTone } from "@/lib/headerTone";
import styles from "./landingAlt.module.css";

gsap.registerPlugin(ScrollTrigger);

const COUNTER_DURATION = 1.8;
const STACK_DEPTH = 3;
const SWIPE_THRESHOLD = 110;
const AUTOPLAY_MS = 3200;
const HEADER_HEIGHT = 72;
const SECTION_BG = "#f7f5f0";

const CARD_THEMES = {
  brand: {
    surface: "border-white/10 bg-brand",
    title: "text-cream",
    body: "text-cream/75",
    accent: "text-secondary",
    bar: "bg-secondary",
    bloom: "bg-white/10",
  },
  secondary: {
    surface: "border-black/10 bg-secondary",
    title: "text-black",
    body: "text-black/70",
    accent: "text-[#2f3a28]",
    bar: "bg-[#2f3a28]",
    bloom: "bg-white/20",
  },
} as const;

function formatIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function stackTransform(depth: number, dragX: number): string {
  if (depth < 0) {
    const fly = Math.min(Math.abs(dragX) + 280, 420);
    return `translate3d(-50%, -50%) translate3d(${dragX < 0 ? -fly : fly}px, 18px, 0) rotate(${dragX < 0 ? -18 : 18}deg) scale(0.96)`;
  }

  if (depth === 0) {
    const rotate = dragX * 0.06;
    return `translate3d(-50%, -50%) translate3d(${dragX}px, 0, 0) rotate(${rotate}deg) scale(1)`;
  }

  const layer = Math.min(depth, STACK_DEPTH);
  const offsetX = layer * 14;
  const offsetY = layer * 10;
  const rotate = layer % 2 === 0 ? layer * 3.5 : layer * -3.5;
  const scale = 1 - layer * 0.045;
  return `translate3d(-50%, -50%) translate3d(${offsetX}px, ${offsetY}px, ${-layer * 40}px) rotate(${rotate}deg) scale(${scale})`;
}

export function AltWhy() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<Array<HTMLElement | null>>([]);
  const countersRef = useRef<Array<HTMLSpanElement | null>>([]);
  const activeRef = useRef(0);
  const dragRef = useRef({ active: false, startX: 0, offset: 0 });
  const pausedRef = useRef(false);
  const [active, setActive] = useState(0);

  const applyLayout = useCallback((index: number, dragX: number) => {
    cardsRef.current.forEach((node, cardIndex) => {
      if (!node) {
        return;
      }

      const depth = cardIndex - index;
      node.style.transform = stackTransform(depth, dragX);
      node.style.opacity = depth > STACK_DEPTH ? "0" : depth < 0 ? "0" : "1";
      node.style.pointerEvents = depth === 0 ? "auto" : "none";
      node.style.zIndex = String(
        whyChoose.features.length - Math.max(depth, -1),
      );
    });
  }, []);

  const goTo = useCallback((index: number) => {
    const total = whyChoose.features.length;
    const next = ((index % total) + total) % total;
    activeRef.current = next;
    setActive(next);
  }, []);

  useEffect(() => {
    applyLayout(active, 0);
  }, [active, applyLayout]);

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

      applyHeaderTone(true, SECTION_BG);
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", syncHeader);

    return () => {
      window.removeEventListener("scroll", syncHeader);
      window.removeEventListener("resize", syncHeader);
    };
  }, []);

  const offscreenRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        offscreenRef.current = !entries.some((entry) => entry.isIntersecting);
      },
      { rootMargin: "120px 0px", threshold: 0.05 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      if (
        pausedRef.current ||
        offscreenRef.current ||
        dragRef.current.active
      ) {
        return;
      }

      goTo(activeRef.current + 1);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [goTo]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyLayout(0, 0);
      return;
    }

    const ctx = gsap.context(() => {
      if (deckRef.current) {
        gsap.fromTo(
          deckRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      countersRef.current.forEach((node, index) => {
        const stat = whyChoose.stats[index];

        if (!node || !stat) {
          return;
        }

        const counter = { value: 0 };
        node.textContent = `0${stat.suffix}`;

        gsap.to(counter, {
          value: stat.value,
          duration: COUNTER_DURATION,
          ease: "power2.out",
          snap: { value: 1 },
          onUpdate: () => {
            node.textContent = `${Math.round(counter.value)}${stat.suffix}`;
          },
          scrollTrigger: {
            trigger: section,
            start: "top 52%",
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [applyLayout]);

  const handleDragStart = (event: ReactPointerEvent<HTMLElement>) => {
    const node = event.currentTarget;
    pausedRef.current = true;
    dragRef.current = { active: true, startX: event.clientX, offset: 0 };
    node.dataset.dragging = "true";
    node.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragRef.current.active) {
      return;
    }

    dragRef.current.offset = event.clientX - dragRef.current.startX;
    applyLayout(activeRef.current, dragRef.current.offset);
  };

  const handleDragEnd = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragRef.current.active) {
      return;
    }

    const node = event.currentTarget;
    const { offset } = dragRef.current;
    dragRef.current.active = false;
    delete node.dataset.dragging;

    if (node.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }

    if (offset <= -SWIPE_THRESHOLD) {
      goTo(activeRef.current + 1);
    } else if (offset >= SWIPE_THRESHOLD) {
      goTo(activeRef.current - 1);
    } else {
      applyLayout(activeRef.current, 0);
    }

    window.setTimeout(() => {
      pausedRef.current = false;
    }, AUTOPLAY_MS);
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Why choose JZ Enterprises"
      data-header-tone="light"
      data-header-bg={SECTION_BG}
      className="relative overflow-hidden bg-cream py-28 md:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(116,129,95,0.12)_0%,transparent_60%)]"
      />

      <div className="relative mx-auto w-full max-w-[1360px] px-5 md:px-8">
        <div className="relative mx-auto flex items-center justify-center py-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(2.4rem,8vw,5.5rem)] font-extrabold tracking-[0.08em] text-secondary/20 uppercase select-none"
          >
            {whyChoose.watermark}
          </span>
          <h2 className="relative z-[1] text-center text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
            {whyChoose.title}
          </h2>
        </div>

        <div
          ref={deckRef}
          className="mt-16 flex flex-col items-center"
          onPointerEnter={() => {
            pausedRef.current = true;
          }}
          onPointerLeave={() => {
            if (!dragRef.current.active) {
              pausedRef.current = false;
            }
          }}
        >
          <div
            className={`relative h-[24.5rem] w-[min(100%,17.5rem)] ${styles.deckStage}`}
          >
            {whyChoose.features.map((feature, index) => {
              const theme = CARD_THEMES[feature.accent];

              return (
                <article
                  key={feature.title}
                  ref={(node) => {
                    cardsRef.current[index] = node;
                  }}
                  aria-hidden={index !== active}
                  onPointerDown={handleDragStart}
                  onPointerMove={handleDragMove}
                  onPointerUp={handleDragEnd}
                  onPointerCancel={handleDragEnd}
                  className={`absolute top-1/2 left-1/2 h-[22rem] w-[16.25rem] cursor-grab overflow-hidden rounded-[1.75rem] border p-7 shadow-[0_28px_60px_rgba(47,58,40,0.22)] select-none active:cursor-grabbing ${theme.surface} ${styles.deckCard}`}
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
                        {formatIndex(index)}
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
                      {feature.title}
                    </h3>

                    <p
                      className={`mt-4 text-[0.9rem] leading-[1.55] font-medium ${theme.body}`}
                    >
                      {feature.description}
                    </p>

                    <span
                      aria-hidden="true"
                      className={`mt-auto h-0.5 w-12 ${theme.bar}`}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-10 flex items-center gap-5">
            <button
              type="button"
              aria-label="Previous card"
              onClick={() => goTo(active - 1)}
              className="flex size-11 items-center justify-center rounded-full border border-brand/25 text-brand transition-colors duration-300 hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              <span aria-hidden="true">←</span>
            </button>

            <div className="flex items-center gap-2">
              {whyChoose.features.map((feature, index) => (
                <button
                  key={feature.title}
                  type="button"
                  aria-label={feature.title}
                  aria-current={index === active}
                  onClick={() => goTo(index)}
                  className={`h-1 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${
                    index === active
                      ? "w-10 bg-brand"
                      : "w-4 bg-brand/20 hover:bg-brand/40"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Next card"
              onClick={() => goTo(active + 1)}
              className="flex size-11 items-center justify-center rounded-full border border-brand/25 text-brand transition-colors duration-300 hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {whyChoose.stats.map((stat, index) => {
            const tone = index % 2 === 0 ? "brand" : "secondary";
            const surface =
              tone === "brand"
                ? "border-white/10 bg-brand text-cream"
                : "border-black/10 bg-secondary text-black";
            const valueColor =
              tone === "brand" ? "text-secondary" : "text-[#2f3a28]";
            const labelColor =
              tone === "brand" ? "text-cream/70" : "text-black/60";
            const bloom =
              tone === "brand" ? "bg-white/10" : "bg-white/25";

            return (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-[1.35rem] border px-5 py-8 text-center shadow-[0_18px_40px_rgba(47,58,40,0.1)] ${surface}`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -top-16 -right-14 size-40 rounded-full ${bloom}`}
                />
                <p
                  className={`relative text-[clamp(2.4rem,5.4vw,3.5rem)] leading-none font-extrabold tracking-[-0.045em] ${valueColor}`}
                >
                  <span
                    ref={(node) => {
                      countersRef.current[index] = node;
                    }}
                  >
                    {`${stat.value}${stat.suffix}`}
                  </span>
                </p>
                <p
                  className={`relative mt-4 text-[0.66rem] font-bold tracking-[0.26em] uppercase ${labelColor}`}
                >
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
