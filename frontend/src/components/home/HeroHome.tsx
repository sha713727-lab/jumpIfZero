"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { heroCopy } from "@/constants/site";

export function HeroHome() {
  const sectionRef = useRef<HTMLElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 40, on: false });

  const onMove = useCallback((event: MouseEvent<HTMLElement>) => {
    const node = sectionRef.current;
    if (!node) {
      return;
    }
    const rect = node.getBoundingClientRect();
    setGlow({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      on: true,
    });
  }, []);

  const onLeave = useCallback(() => {
    setGlow((prev) => ({ ...prev, on: false }));
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setGlow((prev) => ({ ...prev, on: false }));
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-full min-h-screen w-full overflow-hidden bg-brand"
      aria-label="JZ Enterprises"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="hero-photo-blend absolute inset-y-0 right-0 w-full md:w-[68%]">
          <Image
            src={heroCopy.imageSrc}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 68vw, 100vw"
            className="object-cover object-[center_20%] opacity-35 md:opacity-100"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/88 to-brand/15 md:via-brand/78 md:to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_78%_45%,transparent_20%,rgba(116,129,95,0.35)_58%,rgba(116,129,95,0.82)_100%)]" />
      </div>

      <div
        aria-hidden="true"
        className="hero-dots hero-dots-pulse pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: glow.on ? 1 : 0,
          background: `radial-gradient(420px circle at ${glow.x}% ${glow.y}%, rgba(249,161,55,0.22) 0%, rgba(247,245,240,0.08) 28%, transparent 62%)`,
        }}
      />

      <div className="relative z-10 mx-auto flex h-full min-h-screen max-w-[1400px] items-center px-6 pt-28 pb-20 md:px-12 lg:px-16">
        <div className="w-full max-w-[34rem] lg:max-w-[40rem]">
          <p className="text-[0.78rem] font-semibold tracking-[0.28em] text-cream/75 uppercase">
            {heroCopy.eyebrow}
          </p>

          <h1 className="mt-5 text-[clamp(3.4rem,8vw,6.75rem)] leading-[0.92] font-extrabold tracking-[-0.04em]">
            <span className="block text-secondary">{heroCopy.headlineLead}</span>
            <span className="block text-cream">{heroCopy.headlineRest}</span>
          </h1>

          <p className="mt-7 max-w-[28rem] text-[clamp(1.05rem,2.2vw,1.35rem)] leading-[1.55] font-medium text-cream/80">
            {heroCopy.support}
          </p>

          <div aria-hidden="true" className="mt-8 h-px w-16 bg-secondary" />
        </div>
      </div>
    </section>
  );
}
