"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { applyHeaderTone } from "@/lib/headerTone";

gsap.registerPlugin(ScrollTrigger);

const HEADER_HEIGHT = 72;
const FLOW_BG = "#f3f5ef";

const DEFAULT_POSITIONS = [
  { x: -0.8, y: -0.6 },
  { x: 0.7, y: 0.4 },
  { x: -0.5, y: 0.7 },
  { x: 0.6, y: -0.5 },
  { x: -0.8, y: 0.2 },
  { x: 0.8, y: -0.3 },
  { x: -0.6, y: -0.8 },
  { x: 0.4, y: 0.6 },
  { x: -0.7, y: 0.5 },
  { x: 0.5, y: -0.7 },
  { x: -0.4, y: -0.4 },
  { x: 0.3, y: 0.8 },
  { x: -0.8, y: 0.3 },
  { x: 0.6, y: 0.2 },
  { x: -0.2, y: -0.7 },
  { x: 0.7, y: -0.6 },
  { x: -0.5, y: 0.4 },
  { x: 0.4, y: -0.4 },
  { x: -0.6, y: 0.6 },
  { x: 0.8, y: 0.5 },
  { x: -0.3, y: -0.5 },
  { x: 0.5, y: 0.3 },
  { x: -0.7, y: -0.2 },
  { x: 0.2, y: 0.7 },
  { x: -0.4, y: 0.8 },
  { x: 0.6, y: -0.8 },
  { x: -0.8, y: 0.1 },
  { x: 0, y: 0 },
] as const;

export type ImagesFlowProps = {
  readonly flowWatermark?: string;
  readonly flowTitle?: string;
  readonly flowParagraphs?: readonly string[];
  readonly flowCtaLabel?: string;
  readonly flowCtaHref?: string;
  readonly flowText?: string;
  readonly images: readonly string[];
  readonly className?: string;
};

export function ImagesFlow({
  flowWatermark,
  flowTitle,
  flowParagraphs,
  flowCtaLabel,
  flowCtaHref,
  flowText,
  images,
  className,
}: ImagesFlowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const flowRef = useRef<HTMLElement | null>(null);
  const imageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const update = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const sections: ReadonlyArray<{
      element: HTMLElement | null;
      light: boolean;
      bg: string;
    }> = [{ element: flowRef.current, light: true, bg: FLOW_BG }];

    const syncHeader = () => {
      for (const section of sections) {
        if (!section.element) {
          continue;
        }

        const rect = section.element.getBoundingClientRect();

        if (rect.top > HEADER_HEIGHT || rect.bottom <= HEADER_HEIGHT) {
          continue;
        }

        applyHeaderTone(section.light, section.bg);
        return;
      }
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", syncHeader);

    return () => {
      window.removeEventListener("scroll", syncHeader);
      window.removeEventListener("resize", syncHeader);
    };
  }, []);

  useEffect(() => {
    const flow = flowRef.current;
    const imgElements = imageRefs.current.filter(
      (node): node is HTMLDivElement => Boolean(node),
    );

    if (!flow || imgElements.length === 0) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      imgElements.forEach((el, index) => {
        const position = DEFAULT_POSITIONS[index % DEFAULT_POSITIONS.length];
        const isLast = index === images.length - 1;
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          x: isLast ? 0 : (position?.x ?? 0) * dimensions.width * 0.55,
          y: isLast ? 0 : (position?.y ?? 0) * dimensions.height * 0.55,
          z: isLast ? 400 : 800,
          scale: isLast ? 0.72 : 1,
        });
      });
      return;
    }

    const isMobile = dimensions.width < 800;
    const spread = isMobile ? 1.5 : 0.7;
    const screenHeight = dimensions.height;
    const screenWidth = dimensions.width;

    const positions: Array<{ x: number; y: number }> = DEFAULT_POSITIONS.slice(
      0,
      Math.max(images.length, DEFAULT_POSITIONS.length),
    ).map((point) => ({ x: point.x, y: point.y }));

    while (positions.length < images.length) {
      const seed = positions.length + 1;
      positions.push({
        x: ((seed * 37) % 100) / 50 - 1,
        y: ((seed * 53) % 100) / 50 - 1,
      });
    }

    const initPos = images.map(() => ({
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      z: -1000,
      scale: 0,
    }));

    const finalPos = images.map((_, index) => ({
      xPercent: -50,
      yPercent: -50,
      x: (positions[index]?.x ?? 0) * screenWidth * spread,
      y: (positions[index]?.y ?? 0) * screenHeight * spread,
      z: 2000,
      scale: 1,
    }));

    imgElements.forEach((el, index) => {
      const start = initPos[index];
      if (start) {
        gsap.set(el, start);
      }
    });

    const st = ScrollTrigger.create({
      trigger: flow,
      start: "top top",
      end: `+=${screenHeight * 10}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        imgElements.forEach((eachImage, index) => {
          const imgDelay = index * 0.03;
          const imgProgress = Math.max(0, (progress - imgDelay) * 4);
          const start = initPos[index];
          const end = finalPos[index];

          if (!start || !end) {
            return;
          }

          let x = gsap.utils.interpolate(start.x, end.x, imgProgress);
          let y = gsap.utils.interpolate(start.y, end.y, imgProgress);
          let z = gsap.utils.interpolate(start.z, end.z, imgProgress);
          const scale = gsap.utils.interpolate(start.scale, end.scale, imgProgress);

          if (index === images.length - 1) {
            x = 0;
            y = 0;
            z = z * 0.4;
          }

          gsap.set(eachImage, {
            xPercent: -50,
            yPercent: -50,
            x,
            y,
            z,
            scale,
          });
        });
      },
    });

    return () => {
      st.kill();
    };
  }, [dimensions, images]);

  const rootClass = className ? `w-full overflow-x-hidden ${className}` : "w-full overflow-x-hidden";

  return (
    <div ref={containerRef} className={rootClass}>
      <section
        ref={flowRef}
        aria-label="Studio image flow"
        data-header-tone="light"
        data-header-bg={FLOW_BG}
        className="relative min-h-screen overflow-hidden bg-[#f3f5ef]"
      >
        <div className="pointer-events-none absolute inset-0 z-[100] flex items-center justify-center px-5">
          <div className="w-full max-w-[38rem] text-center">
            {flowWatermark || flowTitle || flowParagraphs || flowText ? (
              <>
                <div className="relative flex items-center justify-center py-6">
                  {flowWatermark ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(2.4rem,8vw,5.5rem)] leading-none font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase select-none"
                    >
                      {flowWatermark}
                    </span>
                  ) : null}
                  {flowTitle ? (
                    <h2 className="relative z-[1] text-[clamp(1.55rem,3.4vw,2.55rem)] font-extrabold tracking-[-0.02em] text-black/88 uppercase">
                      {flowTitle}
                    </h2>
                  ) : null}
                </div>
                {flowParagraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-3 text-[clamp(0.98rem,1.8vw,1.15rem)] leading-[1.55] font-medium text-black/55"
                  >
                    {paragraph}
                  </p>
                ))}
                {flowText && !flowParagraphs ? (
                  <p className="whitespace-pre-line text-[clamp(1.05rem,2.4vw,1.35rem)] leading-[1.55] font-medium tracking-[0.02em] text-black/60">
                    {flowText}
                  </p>
                ) : null}
                {flowCtaLabel && flowCtaHref ? (
                  <Link
                    href={flowCtaHref}
                    className="pointer-events-auto mt-8 inline-flex items-center gap-3 rounded-md bg-brand px-6 py-3.5 text-[0.72rem] font-bold tracking-[0.18em] text-white uppercase transition-colors hover:bg-logo-gradient hover:text-black focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
                  >
                    {flowCtaLabel}
                    <span
                      aria-hidden="true"
                      className="inline-flex size-6 items-center justify-center rounded-full border border-current text-[0.75rem] opacity-55"
                    >
                      →
                    </span>
                  </Link>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        <div
          className="absolute inset-0 h-full w-full"
          style={{ perspective: 2000, transformStyle: "preserve-3d" }}
        >
          {images.map((src, index) => {
            const isLast = index === images.length - 1;

            return (
              <div
                key={`${src}-${index}`}
                ref={(el) => {
                  imageRefs.current[index] = el;
                }}
                className={
                  isLast
                    ? "absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
                    : "absolute top-1/2 left-1/2 h-[350px] w-[500px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2"
                }
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={
                    isLast
                      ? "relative h-full w-full overflow-hidden bg-[#e2e4de] after:absolute after:inset-0 after:bg-[rgba(243,245,239,0.55)]"
                      : "relative h-full w-full overflow-hidden bg-[#e2e4de] shadow-[0_10px_22px_rgba(47,58,40,0.07)]"
                  }
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover grayscale contrast-[0.92] brightness-[1.18]"
                    sizes={isLast ? "(max-width: 768px) 100vw, 90vw" : "(max-width: 768px) 90vw, 500px"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
