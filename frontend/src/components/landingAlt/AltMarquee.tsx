"use client";

import { useEffect, useRef, useState } from "react";
import { scrollStory } from "@/constants/scrollStory";
import styles from "./landingAlt.module.css";

const MARQUEE_REPEATS = 2;

type MarqueeRowProps = {
  readonly reverse: boolean;
  readonly outlined: boolean;
  readonly paused: boolean;
};

function MarqueeRow({ reverse, outlined, paused }: MarqueeRowProps) {
  const sequence = Array.from(
    { length: MARQUEE_REPEATS },
    (_, repeat) => repeat,
  );

  return (
    <div className={styles.marqueeMask}>
      <div
        className={`${styles.marqueeTrack} ${reverse ? styles.marqueeReverse : ""} ${paused ? styles.marqueePaused : ""}`}
      >
        {sequence.map((repeat) => (
          <div key={repeat} className="flex shrink-0 items-center">
            {scrollStory.flashLines.map((line) => (
              <span
                key={`${repeat}-${line}`}
                className="flex shrink-0 items-center gap-7 pr-7"
              >
                <span
                  className={`text-[clamp(1.5rem,4vw,2.9rem)] leading-none font-extrabold tracking-[-0.03em] whitespace-nowrap uppercase ${
                    outlined ? styles.outlineText : "text-cream"
                  }`}
                >
                  {line}
                </span>
                <span
                  aria-hidden="true"
                  className="size-1.5 rotate-45 bg-logo-gradient"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AltMarquee() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setPaused(!entries.some((entry) => entry.isIntersecting));
      },
      { rootMargin: "100px 0px", threshold: 0.05 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="What we deliver"
      data-header-tone="dark"
      data-header-bg="#74815f"
      className="relative overflow-hidden border-y border-black/10 bg-brand py-14 md:py-16"
    >
      <div
        aria-hidden="true"
        className="services-frame-dots-dark pointer-events-none absolute inset-0 opacity-30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(13,18,11,0.28)_0%,transparent_38%,transparent_62%,rgba(13,18,11,0.28)_100%)]"
      />

      <div className="relative flex flex-col gap-3">
        <MarqueeRow reverse={false} outlined={false} paused={paused} />
        <MarqueeRow reverse outlined paused={paused} />
      </div>
    </section>
  );
}
