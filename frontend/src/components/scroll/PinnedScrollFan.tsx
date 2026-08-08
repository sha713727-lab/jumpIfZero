"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { applyHeaderTone } from "@/lib/headerTone";

gsap.registerPlugin(ScrollTrigger);

const HEADER_HEIGHT = 72;
const SECTION_BG = "#f7f5f0";
const FAN_ANGLE = 5;

export type FanCard = {
  readonly title: string;
  readonly region: string;
  readonly image: string;
};

export type PinnedScrollFanProps = {
  readonly className?: string;
  readonly cards: readonly FanCard[];
  readonly lead: string;
  readonly rest: string;
  readonly support: string;
};

export function PinnedScrollFan({
  className,
  cards,
  lead,
  rest,
  support,
}: PinnedScrollFanProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const pinHeightRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const circlesRef = useRef<HTMLDivElement | null>(null);
  const circleRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const syncHeader = () => {
      const rect = root.getBoundingClientRect();

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

  useEffect(() => {
    const pinHeight = pinHeightRef.current;
    const container = containerRef.current;
    const circles = circlesRef.current;
    const items = circleRefs.current.filter(
      (node): node is HTMLDivElement => Boolean(node),
    );

    if (!pinHeight || !container || !circles || items.length === 0) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(items, { autoAlpha: 1 });
      items.forEach((item, index) => {
        gsap.set(item, { rotation: index * FAN_ANGLE });
      });
      return;
    }

    gsap.set(items, { autoAlpha: 0 });

    let currentIndex = -1;

    const rotateTo = gsap.quickTo(circles, "rotation", {
      duration: 0.4,
      ease: "power2.out",
    });

    const trigger = ScrollTrigger.create({
      trigger: pinHeight,
      start: "top top",
      end: "bottom bottom",
      pin: container,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const nextIndex = Math.min(
          items.length - 1,
          Math.max(0, Math.floor(self.progress * items.length)),
        );

        if (nextIndex === currentIndex) {
          return;
        }

        if (nextIndex > currentIndex) {
          for (let index = currentIndex + 1; index <= nextIndex; index += 1) {
            const circle = items[index];

            if (!circle) {
              continue;
            }

            gsap.set(circle, {
              autoAlpha: 1,
              rotation: index * FAN_ANGLE,
            });
            gsap.fromTo(
              circle,
              { scale: 0.92 },
              {
                scale: 1,
                ease: "back.out(1.4)",
                duration: 0.45,
                overwrite: true,
              },
            );
          }
        } else {
          for (let index = currentIndex; index > nextIndex; index -= 1) {
            const circle = items[index];

            if (!circle) {
              continue;
            }

            gsap.set(circle, { autoAlpha: 0 });
          }
        }

        rotateTo(-nextIndex * FAN_ANGLE + (FAN_ANGLE / 2) * nextIndex);
        currentIndex = nextIndex;
      },
      onLeaveBack: () => {
        currentIndex = -1;
        gsap.set(items, { autoAlpha: 0, scale: 1 });
        gsap.set(circles, { rotation: 0 });
      },
    });

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      window.clearTimeout(refreshTimer);
      trigger.kill();
      gsap.set(items, { clearProps: "transform,opacity,visibility,scale" });
      gsap.set(circles, { clearProps: "transform" });
    };
  }, [cards.length]);

  const rootClass = className
    ? `relative w-full overflow-hidden bg-cream text-black ${className}`
    : "relative w-full overflow-hidden bg-cream text-black";

  return (
    <section
      ref={rootRef}
      aria-label="Services hero"
      data-header-tone="light"
      data-header-bg={SECTION_BG}
      className={rootClass}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_0%,rgba(249,161,55,0.16)_0%,transparent_58%),radial-gradient(ellipse_40%_50%_at_80%_20%,rgba(92, 104, 73,0.18)_0%,transparent_55%)]"
      />

      <div
        ref={pinHeightRef}
        className="relative h-[420svh] md:h-[500svh]"
      >
        <div
          ref={containerRef}
          className="relative flex h-svh w-full overflow-hidden px-4 pt-24 pb-8 md:px-8 md:pt-28 md:pb-10"
        >
          <div className="relative flex w-full flex-col items-center justify-start">
            <div className="relative z-20 mt-6 max-w-4xl px-2 text-center md:mt-10">
              <p
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-8 select-none text-[clamp(2.4rem,8vw,5.5rem)] leading-none font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase"
              >
                Services
              </p>
              <h1 className="relative text-[clamp(2.2rem,6vw,4.8rem)] leading-[0.95] font-extrabold tracking-[-0.04em]">
                <span className="block text-brand">{lead}</span>
                <span className="mt-1 block text-logo-gradient">{rest}</span>
              </h1>
              <p className="relative mx-auto mt-5 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-[#2f3a28]/75">
                {support}
              </p>
            </div>

            <div
              ref={circlesRef}
              className="relative mt-[24svh] ml-[-60%] aspect-square w-[220%] max-w-none sm:mt-[28svh] sm:ml-[-40%] md:mt-[32svh] md:ml-[-100%] md:w-[300%]"
            >
              {cards.map((card, index) => (
                <div
                  key={`${card.title}-${index}`}
                  ref={(node) => {
                    circleRefs.current[index] = node;
                  }}
                  className="absolute inset-0 flex items-start justify-center"
                >
                  <article className="relative aspect-[3/4] w-[min(42vw,16rem)] min-w-[10.5rem] max-w-[18rem] -translate-y-1/2 overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#e2e4de] shadow-[0_22px_50px_rgba(47,58,40,0.16)] md:w-[20vw] md:min-w-[12rem] md:max-w-[20rem]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 42vw, 20vw"
                      loading="lazy"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,18,11,0.72)_0%,rgba(13,18,11,0.08)_52%,transparent_100%)]"
                    />
                    <div className="absolute inset-x-0 bottom-[12%] z-10 px-4 text-center uppercase md:bottom-[14%] md:px-5">
                      <p className="text-[clamp(1.05rem,2.4vw,1.85rem)] leading-none font-extrabold tracking-[-0.03em] text-cream">
                        {card.title}
                      </p>
                      <span className="mt-2 block text-[0.66rem] font-extrabold tracking-[0.22em] text-logo-gradient md:text-[0.7rem]">
                        {card.region}
                      </span>
                    </div>
                  </article>
                </div>
              ))}
            </div>

            <p className="absolute right-0 bottom-6 left-0 z-20 px-4 text-center text-[0.85rem] font-medium text-[#2f3a28]/65 md:hidden">
              Scroll to fan through each service.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
