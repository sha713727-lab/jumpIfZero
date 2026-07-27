"use client";

import { useEffect, useRef, useState } from "react";
import { whyChoose } from "@/constants/whyChoose";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function useInViewOnce<T extends Element>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || active) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [active, threshold]);

  return { ref, active };
}

function useCountUp(target: number, enabled: boolean, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [duration, enabled, target]);

  return value;
}

function FeatureIcon({
  index,
  className,
}: {
  readonly index: number;
  readonly className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
  };

  switch (index) {
    case 0:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.25" />
          <path d="M3.5 12h17" />
          <path d="M12 3.5c2.4 2.6 3.6 5.4 3.6 8.5S14.4 17.9 12 20.5C9.6 17.9 8.4 15.1 8.4 12S9.6 6.1 12 3.5z" />
        </svg>
      );
    case 1:
      return (
        <svg {...common}>
          <path d="M9 21h6" />
          <path d="M10 17h4" />
          <path d="M7.5 13.5c.8-2.2 2.2-3.5 4.5-4.5 2.3 1 3.7 2.3 4.5 4.5" />
          <path d="M12 3v6" />
        </svg>
      );
    case 2:
      return (
        <svg {...common}>
          <path d="M4 16l4.2-8.4a2 2 0 013.6 0L16 16" />
          <path d="M8 16h10" />
          <circle cx="18.5" cy="7.5" r="2" />
        </svg>
      );
    case 3:
      return (
        <svg {...common}>
          <path d="M4 8.5h16" />
          <path d="M6.5 8.5V17a2 2 0 002 2h7a2 2 0 002-2V8.5" />
          <path d="M9 11.5v4" />
          <path d="M12 11.5v4" />
          <path d="M15 11.5v4" />
          <path d="M9.5 8.5l1-3h3l1 3" />
        </svg>
      );
    case 4:
      return (
        <svg {...common}>
          <rect x="4.5" y="7" width="15" height="12" rx="2" />
          <path d="M8 7V5.8A2.8 2.8 0 0110.8 3h2.4A2.8 2.8 0 0116 5.8V7" />
          <path d="M9.5 13h5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5L12 14.8 7.5 16.7l.9-5L4.8 8.2l5-.7L12 3z" />
        </svg>
      );
  }
}

function StatValue({
  value,
  suffix,
  enabled,
}: {
  readonly value: number;
  readonly suffix: string;
  readonly enabled: boolean;
}) {
  const count = useCountUp(value, enabled);
  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export function WhyChoose() {
  const sectionRef = useRef<HTMLElement>(null);
  const { ref: statsRef, active: statsActive } =
    useInViewOnce<HTMLDivElement>(0.4);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return;
    }

    const syncHeader = () => {
      const rect = node.getBoundingClientRect();
      const coversHeader = rect.top <= 72 && rect.bottom > 72;
      if (!coversHeader) {
        return;
      }

      delete document.documentElement.dataset.heroClear;
      document.documentElement.dataset.heroLight = "1";
      document.documentElement.style.setProperty("--header-bg", "#f7f5f0");
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", syncHeader);
    return () => {
      window.removeEventListener("scroll", syncHeader);
      window.removeEventListener("resize", syncHeader);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-us"
      className="relative overflow-hidden bg-cream py-24 md:py-32"
      aria-label="Why choose JZ Enterprises"
    >
      <div
        aria-hidden="true"
        className="services-light-dots pointer-events-none absolute inset-0 opacity-50"
      />

      <div className="site-container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative mx-auto flex items-center justify-center py-6">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(2.4rem,8vw,5.5rem)] font-extrabold tracking-[0.08em] text-secondary/20 uppercase select-none"
            >
              {whyChoose.watermark}
            </span>
            <h2 className="relative z-[1] text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
              {whyChoose.title}
            </h2>
          </div>
          <p className="mt-4 text-[clamp(1rem,2vw,1.2rem)] leading-[1.6] font-medium text-black/60">
            {whyChoose.summary}
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {whyChoose.features.map((feature, index) => {
            const accent =
              feature.accent === "secondary" ? "secondary" : "brand";
            const accentText =
              accent === "secondary" ? "text-secondary" : "text-brand";
            const accentBorder =
              accent === "secondary" ? "border-secondary" : "border-brand";
            const accentSoft =
              accent === "secondary" ? "bg-secondary/12" : "bg-brand/10";

            return (
              <article
                key={feature.title}
                className={`border-l-[3px] bg-white px-6 py-7 shadow-[0_12px_32px_rgba(116,129,95,0.08)] ${accentBorder}`}
              >
                <div
                  className={`mb-5 inline-flex size-11 items-center justify-center rounded-md ${accentSoft} ${accentText}`}
                >
                  <FeatureIcon index={index} className="size-5" />
                </div>
                <h3 className="text-[1.05rem] font-extrabold tracking-[-0.01em] text-black">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-[1.55] font-medium text-black/55">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>

        <div
          ref={statsRef}
          className="mt-14 grid grid-cols-2 gap-8 bg-white px-6 py-10 shadow-[0_12px_32px_rgba(116,129,95,0.08)] md:mt-16 md:grid-cols-4 md:gap-4 md:px-10 md:py-12"
        >
          {whyChoose.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[clamp(2rem,4vw,2.75rem)] leading-none font-extrabold tracking-[-0.03em] text-brand">
                <StatValue
                  value={stat.value}
                  suffix={stat.suffix}
                  enabled={statsActive}
                />
              </p>
              <p className="mt-3 text-[0.72rem] font-bold tracking-[0.18em] text-black/45 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
