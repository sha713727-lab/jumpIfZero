"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { serviceChapters, servicesIntro } from "@/constants/servicesStory";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function progressBetween(value: number, start: number, end: number) {
  if (end === start) {
    return value >= end ? 1 : 0;
  }

  return clamp((value - start) / (end - start), 0, 1);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function chapterMotion(local: number, index: number, total: number) {
  const slot = 1 / total;
  const start = index * slot;
  const peak = start + slot * 0.14;
  const fadeStart = start + slot * 0.84;
  const end = start + slot;
  const holdLast = index === total - 1;

  const enter = easeInOutCubic(progressBetween(local, start, peak));
  const exit = holdLast
    ? 0
    : easeInOutCubic(progressBetween(local, fadeStart, end));
  const opacity = enter * (1 - exit);

  return {
    opacity,
    y: (1 - enter) * 22 + exit * -20,
    scale: 0.97 + enter * 0.03 - exit * 0.02,
    settle: progressBetween(local, peak, fadeStart),
  };
}

export function ServicesScrollStory() {
  const trackRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);
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
      if (rect.bottom < -120 || rect.top > window.innerHeight + 120) {
        setInView((prev) => (prev ? false : prev));
        return;
      }

      const visible =
        rect.top < window.innerHeight * 0.55 &&
        rect.bottom > window.innerHeight * 0.2;
      setInView((prev) => (prev === visible ? prev : visible));

      const total = track.offsetHeight - window.innerHeight;
      const scrolled = clamp(-rect.top, 0, Math.max(total, 1));
      const next = scrolled / Math.max(total, 1);
      setProgress((prev) => (Math.abs(prev - next) > 0.001 ? next : prev));
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
      }
    };
  }, [updateProgress]);

  const introLocal = progressBetween(progress, 0, 0.1);
  const chaptersLocal = progressBetween(progress, 0.08, 1);
  const introOpacity =
    easeOutCubic(progressBetween(introLocal, 0, 0.4)) *
    (1 - progressBetween(introLocal, 0.65, 1));

  const motions = serviceChapters.map((_, index) =>
    chapterMotion(chaptersLocal, index, serviceChapters.length),
  );

  let darkWeight = 0;
  let lightWeight = 0;
  serviceChapters.forEach((chapter, index) => {
    const weight = motions[index]?.opacity ?? 0;
    if (chapter.tone === "dark") {
      darkWeight += weight;
    } else {
      lightWeight += weight;
    }
  });
  const toneTotal = Math.max(darkWeight + lightWeight, 0.001);
  const darkMix = darkWeight / toneTotal;
  const activeIndex = motions.reduce(
    (best, motion, index) =>
      (motion.opacity ?? 0) > (motions[best]?.opacity ?? 0) ? index : best,
    0,
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const coversHeader = rect.top <= 72 && rect.bottom > 72;
    if (!coversHeader) {
      return;
    }

    const activeTone = serviceChapters[activeIndex]?.tone ?? "light";
    const light = chaptersLocal < 0.04 || activeTone !== "dark";
    delete document.documentElement.dataset.heroClear;
    document.documentElement.dataset.heroLight = light ? "1" : "0";
    document.documentElement.style.setProperty(
      "--header-bg",
      light ? "#f7f5f0" : "#2f3a28",
    );
  }, [activeIndex, chaptersLocal, inView, progress]);

  return (
    <section
      ref={trackRef}
      id="services"
      className="relative h-[1040vh]"
      aria-label="JZ Enterprises services"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-cream">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundColor: `color-mix(in srgb, #f7f5f0 ${100 - darkMix * 100}%, #2f3a28)`,
          }}
        />

        <div
          aria-hidden="true"
          className="services-light-sweep pointer-events-none absolute inset-0"
          style={{ opacity: (1 - darkMix) * 1 }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 72% 42%, rgba(116,129,95,0.08) 0%, transparent 55%)",
            opacity: (1 - darkMix) * 0.85,
          }}
        />

        <div
          aria-hidden="true"
          className="services-light-dots pointer-events-none absolute inset-0"
          style={{ opacity: (1 - darkMix) * 0.55 }}
        />

        <div
          aria-hidden="true"
          className="services-light-sparkles pointer-events-none absolute inset-0"
          style={{ opacity: (1 - darkMix) * 0.7 }}
        />

        <div
          aria-hidden="true"
          className="services-portal pointer-events-none absolute top-1/2 left-1/2 h-[118vmax] w-[118vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            opacity: darkMix,
            transform: `translate(-50%, -50%) scale(${0.74 + darkMix * 0.26})`,
          }}
        />

        <div
          aria-hidden="true"
          className="services-particles pointer-events-none absolute inset-0"
          style={{ opacity: darkMix * 0.8 }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            opacity: (1 - darkMix) * 0.1 * (1 - introOpacity),
          }}
        >
          <Image
            src="/images/jumpIfZeroLogo.png"
            alt=""
            width={420}
            height={394}
            className="h-auto w-[min(52vw,22rem)]"
            unoptimized
            loading="lazy"
          />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          <div
            className="max-w-3xl text-center will-change-transform"
            style={{
              opacity: introOpacity,
              transform: `translateY(${(1 - easeOutCubic(progressBetween(introLocal, 0, 0.4))) * 24}px)`,
            }}
          >
            <p className="text-[0.78rem] font-semibold tracking-[0.28em] text-brand/70 uppercase">
              {servicesIntro.watermark}
            </p>
            <p className="mt-5 text-[clamp(1.35rem,3vw,2rem)] leading-[1.3] font-semibold tracking-[-0.02em] text-brand">
              {servicesIntro.lines[0]}
            </p>
            <p className="mt-4 text-[clamp(1.05rem,2.2vw,1.35rem)] leading-[1.55] font-medium text-brand/80">
              {servicesIntro.lines[1]}
            </p>
          </div>
        </div>

        {serviceChapters.map((chapter, index) => {
          const motion = motions[index];
          if (!motion) {
            return null;
          }

          const isDark = chapter.tone === "dark";
          const ink = isDark ? "text-cream" : "text-black";
          const inkSoft = isDark ? "text-cream/70" : "text-black/65";
          const label = isDark ? "text-secondary" : "text-brand";
          const buttonClass = isDark
            ? "bg-secondary text-black hover:bg-cream"
            : "bg-brand text-white hover:bg-secondary";
          const imageReveal = easeOutCubic(motion.settle);
          const sideBlur = (1 - imageReveal) * 12;
          const sideOpacity = motion.opacity * (0.5 + imageReveal * 0.5);
          const sideLift = (1 - imageReveal) * 28;
          const overlayStrength = isDark
            ? 0.28 - imageReveal * 0.16
            : 0.12 - imageReveal * 0.08;
          const dotsClass = isDark
            ? "services-frame-dots-dark"
            : "services-frame-dots";

          const framesSide = isDark
            ? "md:right-[2%] md:left-auto lg:right-[3%]"
            : "md:left-[2%] md:right-auto lg:left-[3%]";
          const textSide = isDark
            ? "md:left-[3%] md:right-auto md:items-start md:text-left md:pr-6 md:pl-6 lg:pl-10"
            : "md:right-[3%] md:left-auto md:items-start md:text-left md:pl-6 md:pr-6 lg:pr-10";
          const slabSide = isDark
            ? "right-[-4%] left-auto skew-x-[16deg]"
            : "left-[-4%] right-auto -skew-x-[16deg]";
          const framesMobile = isDark
            ? "top-[12%] bottom-auto"
            : "bottom-[8%] top-auto";
          const textMobile = isDark
            ? "bottom-0 top-auto pt-[48%] pb-16 sm:pb-20"
            : "top-0 bottom-auto pt-16 pb-[46%] sm:pt-20";
          const isActiveChapter = index === activeIndex;
          const mountImages =
            motion.opacity > 0.01 || Math.abs(index - activeIndex) <= 1;

          return (
            <div
              key={chapter.category}
              className="absolute inset-0 z-20"
              style={{
                opacity: motion.opacity,
                pointerEvents: motion.opacity > 0.4 ? "auto" : "none",
              }}
              aria-hidden={motion.opacity < 0.2}
            >
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute top-[16%] z-0 hidden h-[72%] w-[42%] bg-brand/15 md:block ${slabSide}`}
                style={{ opacity: sideOpacity * (isDark ? 0.35 : 0.55) }}
              />

              <div
                className={`pointer-events-none absolute inset-x-0 z-[1] mx-auto flex h-[46%] w-[min(92%,34rem)] items-end justify-center gap-3 px-4 md:inset-x-auto md:top-[12%] md:bottom-[12%] md:mx-0 md:h-auto md:w-[52%] md:items-center md:justify-start md:gap-0 md:px-0 lg:w-[50%] ${framesMobile} ${framesSide}`}
                style={{
                  opacity: sideOpacity,
                  filter: `blur(${sideBlur}px)`,
                  transform: `translateY(${sideLift}px)`,
                }}
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-[6%] left-[8%] hidden h-16 w-24 md:block ${dotsClass}`}
                />
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-[10%] bottom-[10%] hidden h-20 w-28 md:block ${dotsClass}`}
                />

                <div className="services-skew-frame relative z-[2] h-full w-[42%] overflow-hidden rounded-md shadow-[0_18px_40px_rgba(0,0,0,0.18)] md:absolute md:top-[6%] md:left-[2%] md:h-[62%] md:w-[62%]">
                  <span className="services-skew-media relative block h-full w-full">
                    {mountImages ? (
                      <Image
                        src={chapter.images.left}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 40vw, 30vw"
                        {...(index === 0
                          ? { priority: true }
                          : {
                              loading: isActiveChapter
                                ? ("eager" as const)
                                : ("lazy" as const),
                            })}
                        unoptimized
                      />
                    ) : null}
                    <span
                      className="absolute inset-0"
                      style={{
                        backgroundColor: isDark
                          ? `rgba(116, 129, 95, ${overlayStrength})`
                          : `rgba(247, 245, 240, ${overlayStrength})`,
                      }}
                    />
                  </span>
                </div>

                <div className="services-skew-frame relative z-[3] h-[82%] w-[34%] overflow-hidden rounded-md shadow-[0_18px_40px_rgba(0,0,0,0.18)] md:absolute md:top-[2%] md:right-[2%] md:h-[44%] md:w-[40%]">
                  <span className="services-skew-media relative block h-full w-full">
                    {mountImages ? (
                      <Image
                        src={chapter.images.right}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 32vw, 20vw"
                        unoptimized
                      />
                    ) : null}
                    <span
                      className="absolute inset-0"
                      style={{
                        backgroundColor: isDark
                          ? `rgba(116, 129, 95, ${overlayStrength})`
                          : `rgba(247, 245, 240, ${overlayStrength})`,
                      }}
                    />
                  </span>
                </div>

                <div className="services-skew-frame relative z-[2] h-[70%] w-[30%] overflow-hidden rounded-md shadow-[0_18px_40px_rgba(0,0,0,0.18)] md:absolute md:right-[8%] md:bottom-[4%] md:h-[42%] md:w-[44%]">
                  <span className="services-skew-media relative block h-full w-full">
                    {mountImages ? (
                      <Image
                        src={chapter.images.bottom}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 28vw, 22vw"
                        unoptimized
                      />
                    ) : null}
                    <span
                      className="absolute inset-0"
                      style={{
                        backgroundColor: isDark
                          ? `rgba(116, 129, 95, ${overlayStrength})`
                          : `rgba(247, 245, 240, ${overlayStrength})`,
                      }}
                    />
                  </span>
                </div>
              </div>

              <div
                className={`absolute inset-x-0 z-10 flex flex-col items-center px-6 text-center will-change-transform md:inset-y-0 md:w-[46%] md:justify-center md:pt-0 md:pb-0 lg:w-[44%] ${textMobile} ${textSide}`}
                style={{
                  transform: `translateY(${motion.y}px) scale(${motion.scale})`,
                }}
              >
                <div className="relative mx-auto flex w-full max-w-xl items-center justify-center py-6">
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center text-[clamp(2rem,5vw,3.6rem)] font-extrabold leading-none tracking-[0.06em] uppercase select-none ${
                      isDark ? "text-secondary/25" : "text-secondary/20"
                    }`}
                  >
                    {chapter.category}
                  </span>
                  <p
                    className={`relative z-[1] w-full text-center text-[clamp(0.95rem,1.8vw,1.15rem)] font-extrabold tracking-[0.28em] uppercase ${label}`}
                  >
                    {chapter.category}
                  </p>
                </div>
                <h2
                  className={`mt-4 max-w-xl text-[clamp(1.35rem,3.2vw,2.35rem)] leading-[1.25] font-semibold tracking-[-0.02em] ${ink}`}
                >
                  {chapter.title}
                </h2>
                <p
                  className={`mt-5 max-w-md text-[clamp(0.95rem,2vw,1.15rem)] leading-[1.5] font-medium tracking-[0.01em] italic ${inkSoft}`}
                >
                  “{chapter.quote}”
                </p>
                <Link
                  href={chapter.href}
                  className={`mt-8 inline-flex items-center gap-3 rounded-md px-6 py-3 text-[0.72rem] font-bold tracking-[0.18em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${buttonClass}`}
                >
                  {chapter.category}
                  <span
                    aria-hidden="true"
                    className="inline-flex size-6 items-center justify-center rounded-full border border-current/35 text-xs"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          );
        })}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-5 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex"
          style={{ opacity: progress > 0.08 ? 0.9 : 0 }}
        >
          {serviceChapters.map((chapter, index) => {
            const active = index === activeIndex && chaptersLocal > 0.02;
            return (
              <span
                key={chapter.category}
                className={`block rounded-full transition-all ${
                  active
                    ? "size-2.5 ring-1 ring-offset-2"
                    : "size-1.5 opacity-50"
                } ${
                  darkMix > 0.5
                    ? active
                      ? "bg-white ring-white ring-offset-[#2f3a28]"
                      : "bg-white"
                    : active
                      ? "bg-brand ring-brand ring-offset-cream"
                      : "bg-brand"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
