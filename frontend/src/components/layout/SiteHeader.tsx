import Image from "next/image";
import Link from "next/link";
import { HeaderMobileNav } from "@/components/layout/HeaderMobileNav";
import { HeaderServicesNav } from "@/components/layout/HeaderServicesNav";
import styles from "@/components/layout/siteHeader.module.css";
import { navLinks, site } from "@/constants/site";

export function SiteHeader() {
  return (
    <header
      className={styles.header}
      style={{ backgroundColor: "var(--header-bg, #5c6849)" }}
    >
      <div className="mx-auto flex h-[4.75rem] w-full max-w-[1360px] items-center gap-4 px-5 md:h-20 md:px-8 lg:px-10 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-6">
        <Link
          href="/"
          className={`relative z-10 flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5 xl:flex-none xl:justify-self-start ${styles.ring} ${styles.readable}`}
        >
          <Image
            src="/images/jumpIfZeroLogo.png"
            alt={`${site.name} logo`}
            width={48}
            height={46}
            className="h-9 w-auto shrink-0 drop-shadow-[0_6px_18px_rgba(249,161,55,0.22)] md:h-10 md:w-auto"
            priority
            loading="eager"
          />
          <span className="min-w-0 leading-tight">
            <span
              className={`block truncate text-[12px] font-bold tracking-[0.14em] uppercase sm:text-[14px] sm:tracking-[0.18em] ${styles.ink}`}
            >
              {site.name}
            </span>
            <span
              className={`mt-0.5 block truncate text-[10px] font-medium tracking-[0.18em] uppercase sm:text-[11px] sm:tracking-[0.22em] ${styles.ink}`}
            >
              {site.tagline}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center justify-center gap-5 justify-self-center xl:flex 2xl:gap-8"
        >
          {navLinks.map((link) =>
            link.name === "Services" ? (
              <HeaderServicesNav key={link.name} />
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className={`${styles.navLink} ${styles.ink} ${styles.ring} ${styles.readable}`}
              >
                {link.name}
              </Link>
            ),
          )}
        </nav>

        <div className="relative z-10 flex shrink-0 items-center justify-end gap-1 sm:gap-2 xl:justify-self-end">
          <HeaderMobileNav />
        </div>
      </div>
    </header>
  );
}
