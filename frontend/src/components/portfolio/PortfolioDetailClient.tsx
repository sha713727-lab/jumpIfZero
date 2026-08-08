"use client";

import Image from "next/image";
import Link from "next/link";
import { MagneticLink } from "@/components/landingAlt/MagneticLink";
import { portfolioCopy } from "@/constants/portfolio";
import type { PortfolioDetail } from "@/lib/data/portfolio";

const HERO_BG = "#0d120b";

export type PortfolioDetailClientProps = {
  readonly item: PortfolioDetail;
};

export function PortfolioDetailClient({ item }: PortfolioDetailClientProps) {
  return (
    <main className="bg-cream text-black">
      <section
        aria-label="Portfolio detail hero"
        data-header-tone="dark"
        data-header-bg={HERO_BG}
        className="px-5 pt-28 pb-8 md:px-8 md:pt-32 md:pb-12"
      >
        <div className="relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[2.25rem] shadow-[0_28px_70px_rgba(47,58,40,0.22)]">
          <div className="relative min-h-[28rem] md:min-h-[36rem]">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,18,11,0.35)_0%,rgba(13,18,11,0.55)_42%,rgba(92, 104, 73,0.92)_100%)]"
            />
            <div className="relative z-10 flex min-h-[28rem] flex-col justify-end px-6 py-10 md:min-h-[36rem] md:px-14 md:py-16">
              <Link
                href="/portfolio"
                className="mb-8 inline-flex w-fit items-center gap-2 text-[0.66rem] font-extrabold tracking-[0.2em] text-cream/75 uppercase transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
              >
                ← Back to portfolio
              </Link>
              <p className="text-[0.66rem] font-extrabold tracking-[0.22em] text-logo-gradient uppercase">
                {item.category}
              </p>
              <h1 className="mt-4 max-w-4xl text-[clamp(2rem,5.2vw,3.75rem)] leading-[1.05] font-extrabold tracking-[-0.045em] text-cream">
                {item.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label={item.title}
        data-header-tone="light"
        data-header-bg="#f7f5f0"
        className="px-5 py-12 md:px-8 md:py-20"
      >
        <div className="mx-auto w-full max-w-[860px]">
          <p className="text-[clamp(1.05rem,2vw,1.25rem)] leading-[1.65] font-medium text-black/70">
            {item.summary}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-black/10 pt-10">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3.5 text-[0.66rem] font-extrabold tracking-[0.18em] text-[#2f3a28] uppercase transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              ← Back to portfolio
            </Link>
            <MagneticLink
              href={portfolioCopy.ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-logo-gradient px-6 py-3.5 text-[0.66rem] font-extrabold tracking-[0.18em] text-black uppercase hover:bg-brand hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {portfolioCopy.ctaLabel}
              <span aria-hidden="true">→</span>
            </MagneticLink>
          </div>
        </div>
      </section>
    </main>
  );
}
