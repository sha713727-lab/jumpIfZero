"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { MagneticLink } from "@/components/landingAlt/MagneticLink";
import styles from "@/components/landingAlt/landingAlt.module.css";
import {
  blogCopy,
  getRelatedPosts,
  type BlogPost,
} from "@/constants/blog";
import { applyHeaderTone } from "@/lib/headerTone";

const HEADER_HEIGHT = 72;
const HERO_BG = "#74815f";
const CREAM_BG = "#f7f5f0";

export type BlogDetailClientProps = {
  readonly post: BlogPost;
};

export function BlogDetailClient({ post }: BlogDetailClientProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const relatedRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);
  const related = getRelatedPosts(post.slug, 3);

  useEffect(() => {
    const zones: ReadonlyArray<{
      element: HTMLElement | null;
      light: boolean;
      bg: string;
    }> = [
      { element: heroRef.current, light: false, bg: HERO_BG },
      { element: articleRef.current, light: true, bg: CREAM_BG },
      { element: relatedRef.current, light: true, bg: CREAM_BG },
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
        aria-label="Article hero"
        data-header-tone="dark"
        data-header-bg={HERO_BG}
        className="px-5 pt-28 pb-8 md:px-8 md:pt-32 md:pb-12"
      >
        <div className="relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[2.25rem] shadow-[0_28px_70px_rgba(47,58,40,0.22)]">
          <div className="relative min-h-[28rem] md:min-h-[36rem]">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,18,11,0.35)_0%,rgba(13,18,11,0.55)_42%,rgba(116,129,95,0.92)_100%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_100%,rgba(249,161,55,0.22)_0%,transparent_58%)]"
            />

            <div className="relative z-10 flex min-h-[28rem] flex-col justify-end px-6 py-10 md:min-h-[36rem] md:px-14 md:py-16">
              <Link
                href="/blog"
                className="mb-8 inline-flex w-fit items-center gap-2 text-[0.66rem] font-extrabold tracking-[0.2em] text-cream/75 uppercase transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
              >
                ← {blogCopy.backLabel}
              </Link>

              <p className="text-[0.66rem] font-extrabold tracking-[0.22em] text-logo-gradient uppercase">
                {post.category} · {post.readTime}
              </p>

              <h1 className="mt-4 max-w-4xl text-[clamp(2rem,5.2vw,3.75rem)] leading-[1.05] font-extrabold tracking-[-0.045em] text-cream">
                {post.title}
              </h1>

              <p className="mt-5 text-[0.78rem] font-extrabold tracking-[0.16em] text-cream/60 uppercase">
                {post.dateLabel} · {post.author}
              </p>
            </div>
          </div>
        </div>
      </section>

      <article
        ref={articleRef}
        aria-label={post.title}
        data-header-tone="light"
        data-header-bg={CREAM_BG}
        className="px-5 py-12 md:px-8 md:py-20"
      >
        <div className="mx-auto w-full max-w-[860px]">
          <p className="text-[clamp(1.15rem,2.2vw,1.35rem)] leading-[1.55] font-extrabold tracking-[-0.02em] text-brand">
            {post.excerpt}
          </p>

          <div className="mt-10 space-y-6 border-t border-black/10 pt-10">
            {post.body.map((paragraph, index) => (
              <div key={paragraph.slice(0, 48)}>
                {index === 1 ? (
                  <div className="relative my-10 aspect-[16/9] overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#e2e4de] shadow-[0_22px_50px_rgba(47,58,40,0.12)]">
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 860px) 100vw, 860px"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <p className="text-[1rem] leading-[1.75] font-medium text-black/70 md:text-[1.05rem]">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-black/10 pt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3.5 text-[0.66rem] font-extrabold tracking-[0.18em] text-[#2f3a28] uppercase transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              ← {blogCopy.backLabel}
            </Link>
            <MagneticLink
              href={blogCopy.ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-logo-gradient px-6 py-3.5 text-[0.66rem] font-extrabold tracking-[0.18em] text-black uppercase hover:bg-brand hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {blogCopy.ctaLabel}
              <span aria-hidden="true">→</span>
            </MagneticLink>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section
          ref={relatedRef}
          aria-label="Related posts"
          data-header-tone="light"
          data-header-bg={CREAM_BG}
          className="px-5 pb-16 md:px-8 md:pb-24"
        >
          <div className="mx-auto w-full max-w-[1360px]">
            <div className="relative mb-10 max-w-2xl">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-5 left-0 select-none text-[clamp(2.4rem,8vw,5.5rem)] leading-none font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase"
              >
                More
              </span>
              <h2 className="relative text-[clamp(1.55rem,3.4vw,2.55rem)] font-extrabold tracking-[-0.02em] text-black uppercase">
                Related reading
              </h2>
            </div>

            <ul className="grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <article className="group overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_16px_36px_rgba(47,58,40,0.08)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_24px_50px_rgba(116,129,95,0.14)]">
                    <Link
                      href={`/blog/${item.slug}`}
                      className="relative block aspect-[16/10] overflow-hidden bg-[#e2e4de] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    >
                      <Image
                        src={item.image}
                        alt={item.imageAlt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        loading="lazy"
                      />
                    </Link>
                    <div className="px-5 py-5">
                      <p className="text-[0.62rem] font-extrabold tracking-[0.18em] text-logo-gradient uppercase">
                        {item.category}
                      </p>
                      <h3 className="mt-2 text-[1.05rem] leading-[1.25] font-extrabold tracking-[-0.02em] text-black">
                        <Link
                          href={`/blog/${item.slug}`}
                          className="transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                        >
                          {item.title}
                        </Link>
                      </h3>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section
        ref={ctaRef}
        aria-label="Article contact CTA"
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
