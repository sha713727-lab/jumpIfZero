import Image from "next/image";
import Link from "next/link";
import { HeaderMobileNav } from "@/components/layout/HeaderMobileNav";
import styles from "@/components/layout/siteHeader.module.css";
import { navLinks, site } from "@/constants/site";

export function SiteHeader() {
  return (
    <header
      className={styles.header}
      style={{ backgroundColor: "var(--header-bg, #5c6849)" }}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between px-5 md:h-[4.25rem] md:px-8 lg:px-10">
        <Link
          href="/"
          className={`relative z-10 flex min-w-0 max-w-[calc(100%-7.5rem)] items-center gap-2.5 sm:max-w-none sm:gap-3 ${styles.ring} ${styles.readable}`}
        >
          <Image
            src="/images/jumpIfZeroLogo.png"
            alt={`${site.name} logo`}
            width={40}
            height={38}
            className="h-7 w-auto shrink-0 drop-shadow-[0_6px_18px_rgba(249,161,55,0.22)] md:h-8 md:w-auto"
            priority
            loading="eager"
          />
          <span className="min-w-0 leading-tight">
            <span
              className={`block truncate text-[9px] font-bold tracking-[0.16em] uppercase sm:text-[11px] sm:tracking-[0.22em] ${styles.ink}`}
            >
              {site.name}
            </span>
            <span
              className={`mt-0.5 block truncate text-[7px] font-medium tracking-[0.22em] uppercase sm:text-[9px] sm:tracking-[0.28em] ${styles.ink}`}
            >
              {site.tagline}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex lg:gap-11"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`${styles.navLink} ${styles.ink} ${styles.ring} ${styles.readable}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="relative z-10 flex items-center gap-2">
          <HeaderMobileNav />
        </div>
      </div>
    </header>
  );
}
