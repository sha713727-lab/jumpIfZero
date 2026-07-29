"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { MagneticLink } from "@/components/landingAlt/MagneticLink";
import styles from "@/components/landingAlt/landingAlt.module.css";
import { blogCopy, blogPosts } from "@/constants/blog";
import { applyHeaderTone } from "@/lib/headerTone";

const HEADER_HEIGHT = 72;
const HERO_BG = "#74815f";
const CREAM_BG = "#f7f5f0";

export function BlogPageClient() {
  const heroRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const zones: ReadonlyArray<{
      element: HTMLElement | null;
      light: boolean;
      bg: string;
    }> = [
      { element: heroRef.current, light: false, bg: HERO_BG },
      { element: gridRef.current, light: true, bg: CREAM_BG },
      { element: ctaRef.current, light: false, bg: HERO_BG },
    ];

    const sync = () => {
      for (const zone of zones) {
        const el = zone.element;

        if (!el) {
          continue;
        }

        const rect = el.getBoundingClientRect();

        if (rect.top > HEADER_HEIGHT || rect.bottom <= HEADER_HEIGHT) {
          continue;
        }

        applyHeaderTone(zone.light, zone.bg);
        return;
      }
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <main className="bg-cream text-black">
      <section
        ref={heroRef}
        aria-label="Blog hero"
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
              width={54}
              height={52}
              className="mx-auto h-12 w-auto"
            />
            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-16 select-none text-[clamp(2.4rem,8vw,5.5rem)] leading-none font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase md:top-20"
            >
              {blogCopy.watermark}
            </p>
            <h1 className="relative mx-auto mt-9 max-w-3xl text-[clamp(1.8rem,4.6vw,3.3rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-cream">
              {blogCopy.title}
            </h1>
            <p className="relative mx-auto mt-6 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-cream/60">
              {blogCopy.lede}
            </p>
          </div>
        </div>
      </section>

      <section
        ref={gridRef}
        aria-label="Blog posts"
        data-header-tone="light"
        data-header-bg={CREAM_BG}
        className="px-5 py-16 md:px-8 md:py-24"
      >
        <div className="mx-auto w-full max-w-[1360px]">
          <div className="relative mx-auto mb-12 max-w-3xl text-center md:mb-16">
            <div className="relative flex items-center justify-center py-6">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(2.4rem,8vw,5.5rem)] font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase select-none"
              >
                Posts
              </span>
              <h2 className="relative z-[1] text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
                {blogCopy.gridTitle}
              </h2>
            </div>
            <p className="relative mx-auto max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-black/55 italic">
              {blogCopy.gridLede}
            </p>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {blogPosts.map((post, index) => {
              const colorful =
                index % 2 === 0
                  ? {
                      card: "border-brand/20 bg-brand text-cream shadow-[0_22px_50px_rgba(116,129,95,0.22)] hover:border-secondary/50 hover:shadow-[0_28px_60px_rgba(249,161,55,0.22)]",
                      bloom: "bg-secondary/25",
                      meta: "text-cream/55",
                      title: "text-cream hover:text-logo-gradient",
                      excerpt: "text-cream/70",
                      read: "text-logo-gradient hover:text-cream",
                      bar: "bg-logo-gradient",
                    }
                  : {
                      card: "border-secondary/25 bg-logo-gradient text-black shadow-[0_22px_50px_rgba(249,161,55,0.2)] hover:border-brand/40 hover:shadow-[0_28px_60px_rgba(116,129,95,0.2)]",
                      bloom: "bg-white/30",
                      meta: "text-[#2f3a28]/65",
                      title: "text-black hover:text-brand",
                      excerpt: "text-black/70",
                      read: "text-brand hover:text-black",
                      bar: "bg-brand",
                    };

              return (
                <li key={post.slug}>
                  <article
                    className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 ${colorful.card}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -top-16 -right-12 size-40 rounded-full blur-2xl ${colorful.bloom}`}
                    />
                    <Link
                      href={`/blog/${post.slug}`}
                      className="relative aspect-[16/10] overflow-hidden bg-[#e2e4de] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    >
                      <Image
                        src={post.image}
                        alt={post.imageAlt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,18,11,0.28)_0%,transparent_58%)]"
                      />
                    </Link>

                    <div className="relative flex flex-1 flex-col px-5 py-6 md:px-6">
                      <span
                        aria-hidden="true"
                        className={`mb-4 h-1 w-12 rounded-full ${colorful.bar}`}
                      />
                      <p
                        className={`text-[0.66rem] font-extrabold tracking-[0.18em] uppercase ${colorful.meta}`}
                      >
                        {post.dateLabel} · {post.readTime}
                      </p>
                      <h3 className="mt-3 text-[clamp(1.1rem,2vw,1.35rem)] leading-[1.2] font-extrabold tracking-[-0.03em]">
                        <Link
                          href={`/blog/${post.slug}`}
                          className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${colorful.title}`}
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <p
                        className={`mt-3 flex-1 text-[0.92rem] leading-[1.6] font-medium ${colorful.excerpt}`}
                      >
                        {post.excerpt}
                      </p>
                      <Link
                        href={`/blog/${post.slug}`}
                        className={`mt-6 inline-flex w-fit items-center gap-2 text-[0.66rem] font-extrabold tracking-[0.2em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${colorful.read}`}
                      >
                        {blogCopy.readLabel}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        ref={ctaRef}
        aria-label="Blog contact CTA"
        data-header-tone="dark"
        data-header-bg={HERO_BG}
        className={`px-5 pb-24 md:px-8 md:pb-32 ${styles.scene}`}
      >
        <div className="relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[2.25rem] bg-brand px-6 py-16 text-center md:px-16 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(249,161,55,0.2)_0%,transparent_62%)]"
          />
          <div className="relative">
            <h2
              className={`mx-auto max-w-3xl text-[clamp(1.8rem,4.6vw,3.3rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-cream ${styles.depthText}`}
            >
              {blogCopy.ctaTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-cream/60">
              {blogCopy.ctaLede}
            </p>
            <MagneticLink
              href={blogCopy.ctaHref}
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-logo-gradient px-9 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-black uppercase hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none"
            >
              {blogCopy.ctaLabel}
              <span aria-hidden="true">→</span>
            </MagneticLink>
          </div>
        </div>
      </section>
    </main>
  );
}
