"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { applyHeaderTone } from "@/lib/headerTone";
import { navLinks, site } from "@/constants/site";

const HEADER_HEIGHT = 72;
const SECTION_BG = "#74815f";

const footerLinks = [
  { name: "Home", href: "/" },
  ...navLinks,
] as const;

function ExternalArrow({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 11.5 11.5 4.5" />
      <path d="M6 4.5h5.5V10" />
    </svg>
  );
}

export function SiteFooter() {
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const footer = footerRef.current;

    if (!footer) {
      return;
    }

    const syncHeader = () => {
      const rect = footer.getBoundingClientRect();

      if (rect.top > HEADER_HEIGHT || rect.bottom <= HEADER_HEIGHT) {
        return;
      }

      applyHeaderTone(false, SECTION_BG);
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
    <footer
      ref={footerRef}
      aria-label="Site footer"
      data-header-tone="dark"
      data-header-bg={SECTION_BG}
      className="relative overflow-hidden bg-brand text-cream"
    >
      <div className="relative mx-auto w-full max-w-[1360px] px-5 pt-16 pb-8 md:px-8 md:pt-20 md:pb-10 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-10">
          <Link
            href="/"
            className="flex items-center gap-3 justify-self-start focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:outline-none"
          >
            <Image
              src="/images/jumpIfZeroLogo.png"
              alt=""
              width={40}
              height={38}
              className="h-8 w-auto md:h-9 md:w-auto"
            />
            <span className="text-[0.95rem] font-bold tracking-[-0.02em]">
              {site.name}
            </span>
          </Link>

          <nav
            aria-label="Footer"
            className="flex flex-col items-center gap-3 text-center justify-self-center"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.92rem] font-medium tracking-[-0.01em] text-cream/90 transition-colors hover:text-cream focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:outline-none"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="md:justify-self-end md:text-right">
            <Link
              href="/#contact"
              className="group inline-flex items-center gap-2 text-[0.92rem] font-medium tracking-[-0.01em] text-cream transition-colors hover:text-secondary focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:outline-none"
            >
              Contact
              <ExternalArrow className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <div
              aria-hidden="true"
              className="mt-3 h-px w-full max-w-[12rem] bg-cream/70 md:ml-auto md:w-40"
            />
          </div>
        </div>

        <p
          aria-hidden="true"
          className="text-logo-gradient mt-20 select-none text-center text-[clamp(2.4rem,11vw,8.5rem)] leading-[0.9] font-extrabold tracking-[-0.05em] uppercase md:mt-28"
        >
          {site.name}
        </p>

        <p className="mt-8 text-center text-[0.68rem] font-medium tracking-[0.08em] text-cream/55">
          © {new Date().getFullYear()} All rights reserved by {site.name}.
        </p>
      </div>
    </footer>
  );
}
