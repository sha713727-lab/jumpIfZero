"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ContactAside, ContactDirect } from "@/components/contact/ContactForm";
import { contactCopy } from "@/constants/contact";
import { applyHeaderTone } from "@/lib/headerTone";

const HEADER_HEIGHT = 72;
const HERO_BG = "#74815f";

export function ContactPageClient() {
  const heroRef = useRef<HTMLElement | null>(null);
  const formRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const form = formRef.current;

    if (!hero || !form) {
      return;
    }

    const syncHeader = () => {
      const sections: ReadonlyArray<{
        element: HTMLElement;
        light: boolean;
        bg: string;
      }> = [
        { element: hero, light: false, bg: HERO_BG },
        { element: form, light: true, bg: "#f7f5f0" },
      ];

      for (const section of sections) {
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

  return (
    <main className="bg-cream">
      <section
        ref={heroRef}
        aria-label="Contact hero"
        data-header-tone="dark"
        data-header-bg={HERO_BG}
        className="px-5 pt-28 pb-8 md:px-8 md:pt-32 md:pb-10"
      >
        <div className="relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[2.25rem] bg-brand px-6 py-16 text-center md:px-16 md:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(247,245,240,0.18)_0%,transparent_62%)]"
          />

          <div className="relative">
            <Image
              src="/images/jumpIfZeroLogo.png"
              alt=""
              aria-hidden="true"
              width={54}
              height={52}
              className="mx-auto h-12 w-auto"
            />

            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-16 select-none text-[clamp(2.4rem,8vw,5.5rem)] leading-none font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase md:top-20"
            >
              Contact
            </p>

            <h1 className="relative mx-auto mt-9 max-w-3xl text-[clamp(1.8rem,4.6vw,3.3rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-cream">
              {contactCopy.title}
            </h1>

            <p className="relative mx-auto mt-6 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-cream/60">
              {contactCopy.lede}
            </p>

            <p className="relative mx-auto mt-5 text-[0.7rem] font-extrabold tracking-[0.2em] text-cream/70 uppercase">
              {contactCopy.responseTime}
            </p>
          </div>
        </div>
      </section>

      <section
        ref={formRef}
        aria-label="Contact form"
        data-header-tone="light"
        data-header-bg="#f7f5f0"
        className="px-5 pt-8 pb-24 md:px-8 md:pt-12 md:pb-32"
      >
        <div className="mx-auto grid w-full max-w-[1360px] gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:items-start">
          <div className="order-2 lg:order-1">
            <ContactDirect />
          </div>
          <div className="order-1 lg:order-2">
            <ContactAside />
          </div>
        </div>
      </section>
    </main>
  );
}
