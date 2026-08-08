"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { applyHeaderTone } from "@/lib/headerTone";
import { faqIntro } from "@/constants/faq";
import type { FaqItem } from "@/lib/data/faqs";

gsap.registerPlugin(ScrollTrigger);

const HEADER_HEIGHT = 72;
const SECTION_BG = "#f7f5f0";

export function AltFaq({
  items,
}: Readonly<{
  items: readonly FaqItem[];
}>) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [openIndex, setOpenIndex] = useState(0);

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

  useEffect(() => {
    const section = sectionRef.current;
    const list = listRef.current;

    if (!section || !list) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const items = Array.from(list.children);

    const ctx = gsap.context(() => {
      gsap.from(items, {
        y: 28,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
        stagger: 0.06,
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: "top 68%",
          toggleActions: "play none none none",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    panelRefs.current.forEach((panel, index) => {
      if (!panel) {
        return;
      }

      const open = index === openIndex;
      gsap.to(panel, {
        height: open ? panel.scrollHeight : 0,
        opacity: open ? 1 : 0,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true,
      });
    });
  }, [openIndex]);

  return (
    <section
      ref={sectionRef}
      id="faq"
      aria-label="Frequently asked questions"
      data-header-tone="light"
      data-header-bg="#f7f5f0"
      className="relative overflow-hidden bg-cream py-24 md:py-32"
    >
      <div className="relative mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <div className="relative mx-auto flex max-w-3xl items-center justify-center py-6 text-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(2.4rem,8vw,5.5rem)] font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase select-none"
          >
            {faqIntro.watermark}
          </span>
          <h2 className="relative z-[1] text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
            {faqIntro.title}
          </h2>
        </div>

        <div className="mx-auto mt-2 max-w-xl space-y-2 text-center">
          {faqIntro.lines.map((line) => (
            <p
              key={line}
              className="text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-black/55 italic"
            >
              {line}
            </p>
          ))}
        </div>

        <div className="mt-12 border-t border-black/10 md:mt-14" />

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:items-start lg:gap-16 xl:gap-20">
          <aside className="flex max-w-md items-center justify-center self-center">
            <Image
              src={faqIntro.image}
              alt={faqIntro.imageAlt}
              width={457}
              height={430}
              className="h-auto w-[min(70%,17.5rem)] object-contain"
            />
          </aside>

          <div ref={listRef} className="border-t border-black/10">
            {items.map((item, index) => {
              const open = index === openIndex;

              return (
                <div key={item.question} className="border-b border-black/10">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? -1 : index)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none md:py-7"
                  >
                    <span className="text-[clamp(1rem,2vw,1.2rem)] leading-[1.35] font-extrabold tracking-[-0.02em] text-black">
                      {item.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`shrink-0 text-[1.35rem] leading-none font-light text-black transition-transform duration-300 ${
                        open ? "rotate-45 text-logo-gradient" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                  <div
                    ref={(node) => {
                      panelRefs.current[index] = node;
                    }}
                    className="h-0 overflow-hidden opacity-0"
                  >
                    <p className="max-w-2xl pb-7 text-[0.95rem] leading-[1.7] font-medium text-black/55 md:pb-8">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
