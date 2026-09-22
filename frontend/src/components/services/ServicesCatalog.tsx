"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { RevealText } from "@/components/landingAlt/RevealText";
import { serviceNavCategories } from "@/constants/servicesNav";
import {
  getServicePillarBlurb,
  servicesPageCopy,
} from "@/constants/servicesPage";

export function ServicesCatalog() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
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
      if (cancelled) {
        return;
      }
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const pillars = section.querySelectorAll<HTMLElement>("[data-pillar]");
        pillars.forEach((pillar) => {
          const children = pillar.querySelectorAll<HTMLElement>("[data-child]");
          gsap.from(pillar, {
            opacity: 0,
            y: 36,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: pillar,
              start: "top 88%",
              once: true,
            },
          });
          if (children.length > 0) {
            gsap.from(children, {
              opacity: 0,
              y: 14,
              duration: 0.45,
              stagger: 0.06,
              ease: "power2.out",
              scrollTrigger: {
                trigger: pillar,
                start: "top 82%",
                once: true,
              },
            });
          }
        });
      }, section);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Service offerings"
      data-header-tone="light"
      data-header-bg="#f7f5f0"
      className="bg-cream px-5 py-20 md:px-8 md:py-28"
    >
      <div className="relative mx-auto w-full max-w-[1360px]">
        <div className="relative mx-auto max-w-3xl text-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(2.4rem,8vw,5.5rem)] font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase select-none"
          >
            Offerings
          </span>
          <h2 className="relative z-[1] text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
            <RevealText text={servicesPageCopy.offeringsTitle} />
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-black/55 italic">
            {servicesPageCopy.offeringsLede}
          </p>
        </div>

        <ul className="mt-14 space-y-14 md:mt-16 md:space-y-16">
          {serviceNavCategories.map((category) => {
            const blurb = getServicePillarBlurb(category.slug);
            return (
              <li key={category.slug} data-pillar>
                <article className="border-t border-black/12 pt-8 md:grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-12 md:pt-10">
                  <div>
                    <p className="text-[0.72rem] font-extrabold tracking-[0.18em] text-[#5c3d18] uppercase">
                      {category.title}
                    </p>
                    <h3 className="mt-3 max-w-xl text-[1.25rem] leading-[1.25] font-extrabold tracking-[-0.02em] text-black md:text-[1.4rem]">
                      {blurb?.title ?? category.title}
                    </h3>
                    {blurb ? (
                      <p className="mt-3 max-w-lg text-[0.9rem] leading-[1.55] font-medium text-black/55">
                        {blurb.body}
                      </p>
                    ) : null}
                    <Link
                      href={category.href}
                      className="group mt-6 inline-flex items-center gap-2 text-[0.72rem] font-extrabold tracking-[0.16em] text-brand uppercase transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      View {category.title}
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                    {blurb ? (
                      <ul className="mt-6 space-y-2">
                        {blurb.highlights.map((item, index) => (
                          <li
                            key={`${category.slug}-highlight-${index}`}
                            className="text-[0.84rem] leading-[1.45] font-medium text-black/70"
                          >
                            <span className="mr-2 text-brand" aria-hidden="true">
                              —
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-0">
                    {category.children.map((child) => (
                      <li key={child.slug} data-child>
                        <Link
                          href={child.href}
                          className="group flex h-full items-center justify-between gap-3 border border-brand/20 bg-brand px-4 py-3.5 transition-[transform,border-color,background-color,color] duration-300 hover:-translate-y-0.5 hover:border-secondary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                        >
                          <span className="text-[0.92rem] leading-[1.35] font-extrabold tracking-[-0.01em] text-cream transition-colors duration-300 group-hover:text-[#0d120b]">
                            {child.title}
                          </span>
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-logo-gradient transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:text-[#0d120b]"
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
