"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { heroCopy, navLinks, site } from "@/constants/site";

function ProfileIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19.2c1.6-3.1 4-4.7 6.5-4.7s4.9 1.6 6.5 4.7" />
    </svg>
  );
}

function MenuIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function SiteHeader() {
  const [light, setLight] = useState(false);
  const [clear, setClear] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setLight(document.documentElement.dataset.heroLight === "1");
      setClear(document.documentElement.dataset.heroClear === "1");
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-hero-light", "data-hero-clear"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ink = light ? "text-brand" : "text-white";
  const inkMuted = light ? "text-brand" : "text-white";
  const hover = "hover:text-secondary";
  const ring = light
    ? "focus-visible:ring-brand/50"
    : "focus-visible:ring-white/70";
  const drawerPanel = light
    ? "border-brand/15 bg-cream text-brand"
    : "border-white/15 bg-[#1a2117] text-white";
  const headerShell = light
    ? "border-brand/15 text-brand"
    : clear
      ? "border-transparent text-white"
      : "border-white/10 text-white";
  const headerBlur = clear ? "" : "backdrop-blur-md";
  const readable = clear
    ? "drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)]"
    : "";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[80] border-b transition-[background-color,border-color,color] duration-300 ${headerBlur} ${headerShell}`}
      style={{ backgroundColor: "var(--header-bg, #74815f)" }}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between px-5 md:h-[4.25rem] md:px-8 lg:px-10">
        <Link
          href="/"
          className={`relative z-10 flex shrink-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 ${ring} ${readable}`}
        >
          <Image
            src="/images/jumpIfZeroLogo.png"
            alt={site.name}
            width={40}
            height={38}
            className="h-7 w-auto drop-shadow-[0_6px_18px_rgba(249,161,55,0.22)] md:h-8 md:w-auto"
            priority
          />
          <span className="hidden leading-tight sm:block">
            <span
              className={`block text-[11px] font-bold tracking-[0.22em] uppercase ${ink}`}
            >
              {site.name}
            </span>
            <span
              className={`mt-0.5 block text-[9px] font-medium tracking-[0.28em] uppercase ${inkMuted}`}
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
              key={link.href}
              href={link.href}
              className={`text-[10px] font-semibold tracking-[0.22em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 ${inkMuted} ${hover} ${ring} ${readable}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="relative z-10 flex items-center gap-2">
          <Link
            href={heroCopy.loginHref}
            aria-label="Login"
            className={`inline-flex size-9 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 ${ink} ${hover} ${ring} ${readable}`}
          >
            <ProfileIcon className="size-5" />
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-drawer"
            className={`inline-flex size-9 items-center justify-center md:hidden focus-visible:outline-none focus-visible:ring-2 ${ink} ${hover} ${ring} ${readable}`}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <CloseIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[90] md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button
          type="button"
          aria-label="Close menu overlay"
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          id="mobile-nav-drawer"
          className={`absolute top-0 right-0 flex h-full w-[min(20rem,86vw)] flex-col border-l shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out ${drawerPanel} ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex h-16 items-center justify-between px-5">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase">
              Menu
            </p>
            <button
              type="button"
              aria-label="Close menu"
              className={`inline-flex size-9 items-center justify-center focus-visible:outline-none focus-visible:ring-2 ${ring}`}
              onClick={() => setOpen(false)}
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1 px-3 pb-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-3 text-sm font-semibold tracking-[0.14em] uppercase transition-colors ${hover}`}
                onClick={() => setOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href={heroCopy.loginHref}
              className={`mt-3 inline-flex items-center gap-2 rounded-md px-3 py-3 text-sm font-semibold tracking-[0.14em] uppercase transition-colors ${hover}`}
              onClick={() => setOpen(false)}
            >
              <ProfileIcon className="size-4" />
              Login
            </Link>
          </nav>
        </aside>
      </div>
    </header>
  );
}
