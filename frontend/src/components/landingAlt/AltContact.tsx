"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollStory } from "@/constants/scrollStory";
import { applyHeaderTone } from "@/lib/headerTone";
import { MagneticLink } from "./MagneticLink";
import { RevealText } from "./RevealText";
import styles from "./landingAlt.module.css";

gsap.registerPlugin(ScrollTrigger);

const HEADER_HEIGHT = 72;
const SECTION_BG = "#f7f5f0";
const CLOSING_LINE_INDEX = 5;
const FINAL_LINE_INDEX = 6;

export function AltContact() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

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
    const panel = panelRef.current;

    if (!section || !panel) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panel,
        { rotateX: 18, z: -360, opacity: 0.2 },
        {
          rotateX: 0,
          z: 0,
          opacity: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            end: "top 40%",
            scrub: 0.8,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const closingLine = scrollStory.paragraphLines[CLOSING_LINE_INDEX];
  const finalLine = scrollStory.paragraphLines[FINAL_LINE_INDEX];

  if (!closingLine || !finalLine) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-label="Contact JZ Enterprises"
      data-header-tone="light"
      data-header-bg="#f7f5f0"
      className={`relative overflow-hidden bg-cream px-5 pt-24 pb-12 md:px-8 md:pt-32 ${styles.scene}`}
    >
      <div
        ref={panelRef}
        className="relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[2.25rem] bg-[#0d120b] px-6 py-20 text-center [transform-style:preserve-3d] md:px-16 md:py-28"
      >
        <div
          aria-hidden="true"
          className="hero-mesh pointer-events-none absolute inset-0 opacity-50"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(249,161,55,0.22)_0%,transparent_62%)]"
        />
        <div
          aria-hidden="true"
          className="hero-grain pointer-events-none absolute inset-0"
        />

        <div className="relative">
          <Image
            src="/images/jumpIfZeroLogo.png"
            alt=""
            width={54}
            height={52}
            className="mx-auto h-12 w-auto"
          />

          <h2
            className={`mx-auto mt-9 max-w-3xl text-[clamp(1.8rem,4.6vw,3.3rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-cream ${styles.depthText}`}
          >
            <RevealText text={closingLine} />
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-[clamp(0.96rem,1.8vw,1.1rem)] leading-[1.6] font-medium text-cream/60">
            {finalLine}
          </p>

          <MagneticLink
            href="/#contact"
            className="mt-11 inline-flex items-center gap-3 rounded-full bg-secondary px-9 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-black uppercase focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none"
          >
            Contact
            <span aria-hidden="true">→</span>
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}
