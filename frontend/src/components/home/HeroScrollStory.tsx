"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { scrollStory } from "@/constants/scrollStory";
import { site } from "@/constants/site";
import { applyHeaderTone } from "@/lib/headerTone";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function progressBetween(value: number, start: number, end: number) {
  if (end === start) {
    return value >= end ? 1 : 0;
  }

  return clamp((value - start) / (end - start), 0, 1);
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function oneByOneMotion(
  local: number,
  index: number,
  total: number,
  holdLast: boolean,
) {
  const slot = 1 / total;
  const start = index * slot;
  const peak = start + slot * 0.28;
  const fadeStart = start + slot * 0.62;
  const end = start + slot;

  const enter = easeOutCubic(progressBetween(local, start, peak));
  const exit =
    holdLast && index === total - 1
      ? 0
      : progressBetween(local, fadeStart, end);
  const opacity = enter * (1 - exit);

  return {
    opacity,
    x: 0,
    y: (1 - enter) * 48 + exit * -44,
  };
}

export function HeroScrollStory() {
  const trackRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(0);

  const updateProgress = useCallback(() => {
    if (rafRef.current) {
      return;
    }

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0;
      const track = trackRef.current;
      if (!track) {
        return;
      }

      const rect = track.getBoundingClientRect();
      if (rect.bottom < 0) {
        setProgress((prev) => (prev === 1 ? prev : 1));
        return;
      }
      if (rect.top > window.innerHeight) {
        setProgress((prev) => (prev === 0 ? prev : 0));
        return;
      }

      const total = track.offsetHeight - window.innerHeight;
      const scrolled = clamp(-rect.top, 0, Math.max(total, 1));
      const next = scrolled / Math.max(total, 1);
      setProgress((prev) => (Math.abs(prev - next) > 0.008 ? next : prev));

      const coversHeader = rect.top < 1 && rect.bottom > 72;
      if (coversHeader) {
        applyHeaderTone(true, "#f7f5f0");
      }
    });
  }, []);

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [updateProgress]);

  const flashLocal = progressBetween(progress, 0, 0.3);
  const storyLocal = progressBetween(progress, 0.28, 0.68);
  const brandLocal = progressBetween(progress, 0.68, 1);

  const flashExit = progressBetween(flashLocal, 0.55, 1);
  const flashOpacity = 1 - flashExit;
  const flashX = flashExit * 88;
  const flashY = flashExit * 72;

  const brandEnter = easeOutCubic(progressBetween(brandLocal, 0.12, 0.58));
  const brandBurst = easeOutCubic(progressBetween(brandLocal, 0, 0.72));
  const brandHold = progressBetween(brandLocal, 0.55, 0.82);
  const brandBg = progressBetween(brandLocal, 0.2, 0.7);

  return (
    <section
      ref={trackRef}
      className="relative z-[1] -mt-px h-[520vh]"
      aria-label="JZ Enterprises introduction"
    >
      <div className="sticky top-0 z-[1] h-screen overflow-hidden bg-cream">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[35]"
          style={{
            background:
              "radial-gradient(circle at center, rgba(232, 238, 220, 0.95) 0%, rgba(92, 104, 73, 0.28) 48%, rgba(92, 104, 73, 0.18) 100%)",
            opacity: brandBg,
          }}
        />

        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-6">
          <div
            className="max-w-3xl text-center will-change-transform"
            style={{
              opacity: flashOpacity,
              transform: `translate(${flashX}px, ${flashY}px)`,
            }}
          >
            {scrollStory.flashLines.map((line) => (
              <p
                key={line}
                className="text-[clamp(1.75rem,4.5vw,3.25rem)] leading-[1.25] font-semibold tracking-[-0.03em] text-[#5a5a5a]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-6">
          {scrollStory.paragraphLines.map((line, index) => {
            const motion = oneByOneMotion(
              storyLocal,
              index,
              scrollStory.paragraphLines.length,
              false,
            );
            const isTitle = index === 0;
            const isClosing = index === scrollStory.paragraphLines.length - 1;

            return (
              <p
                key={`${line}-${index}`}
                className={
                  isTitle
                    ? "absolute max-w-4xl text-center text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-[-0.03em] text-brand will-change-transform"
                    : isClosing
                      ? "absolute max-w-4xl text-center text-[clamp(1.35rem,3vw,2rem)] font-medium text-black/55 will-change-transform"
                      : "absolute max-w-4xl text-center text-[clamp(1.35rem,3.2vw,2.15rem)] leading-[1.45] font-medium text-black/75 will-change-transform"
                }
                style={{
                  opacity: motion.opacity,
                  transform: `translate(${motion.x}px, ${motion.y}px)`,
                }}
              >
                {line}
              </p>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center overflow-hidden"
          style={{ opacity: Math.min(1, brandEnter + brandHold * 0.15) }}
        >
          <div
            aria-hidden="true"
            className="brand-burst pointer-events-none absolute top-1/2 left-1/2 h-[160vmax] w-[160vmax]"
            style={{
              opacity: brandBurst * 0.95,
              transform: `translate(-50%, -50%) scale(${0.42 + brandBurst * 1.55}) rotate(${brandBurst * 18}deg)`,
            }}
          />

          {[0, 30, 60, 90, 120, 150].map((angle) => (
            <div
              key={angle}
              aria-hidden="true"
              className="brand-streak pointer-events-none absolute top-1/2 left-1/2 h-[2px] w-[85vmax] origin-left"
              style={{
                opacity: brandBurst * 0.45,
                transform: `rotate(${angle}deg) scaleX(${0.35 + brandBurst * 1.1})`,
              }}
            />
          ))}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(247,245,240,0.55) 0%, rgba(92, 104, 73,0.2) 32%, transparent 58%)",
              opacity: brandBurst * 0.7,
            }}
          />

          {[
            {
              x: -34,
              y: -28,
              rotate: -18,
              delay: 0,
              w: "4.5rem",
              h: "6.5rem",
            },
            {
              x: 30,
              y: -24,
              rotate: 14,
              delay: 0.08,
              w: "5rem",
              h: "7rem",
            },
            {
              x: -32,
              y: 26,
              rotate: 10,
              delay: 0.12,
              w: "4.75rem",
              h: "6.75rem",
            },
            {
              x: 28,
              y: 24,
              rotate: -12,
              delay: 0.18,
              w: "5.25rem",
              h: "7.25rem",
            },
            {
              x: -42,
              y: 2,
              rotate: 22,
              delay: 0.05,
              w: "3.75rem",
              h: "5.5rem",
            },
            {
              x: 40,
              y: 4,
              rotate: -20,
              delay: 0.14,
              w: "4rem",
              h: "5.75rem",
            },
          ].map((card) => {
            const push = 0.55 + brandBurst * (1.15 + card.delay);
            return (
              <div
                key={`${card.x}-${card.y}`}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 rounded-md bg-gradient-to-br from-brand/35 via-white/40 to-brand/20 shadow-[0_12px_40px_rgba(92, 104, 73,0.18)]"
                style={{
                  width: card.w,
                  height: card.h,
                  opacity: brandBurst * (0.35 + card.delay),
                  filter: `blur(${(1 - brandBurst) * 8 + 1.5}px)`,
                  transform: `translate(-50%, -50%) translate(${card.x * push}vmin, ${card.y * push}vmin) rotate(${card.rotate}deg) scale(${0.55 + brandBurst * 0.85})`,
                }}
              />
            );
          })}

          <div
            className="relative z-10 flex flex-col items-center px-6 text-center will-change-transform"
            style={{
              opacity: brandEnter,
              transform: `scale(${0.82 + brandEnter * 0.18}) translateY(${(1 - brandEnter) * 28}px)`,
            }}
          >
            <Image
              src="/images/jumpIfZeroLogo.png"
              alt={site.name}
              width={180}
              height={168}
              className="logo-shadow mb-7 h-auto w-[clamp(6rem,15vw,9.5rem)]"
              priority
            />
            <p className="text-[clamp(1.9rem,4.8vw,3.6rem)] font-bold tracking-[0.16em] text-brand uppercase">
              {site.name}
            </p>
            <p className="mt-3 text-[clamp(0.78rem,1.5vw,0.95rem)] font-semibold tracking-[0.32em] text-brand/65 uppercase">
              {site.tagline}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
