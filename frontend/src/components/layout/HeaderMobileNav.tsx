"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { heroCopy, navLinks } from "@/constants/site";
import styles from "@/components/layout/siteHeader.module.css";

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

export function HeaderMobileNav() {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <Link
        href={heroCopy.loginHref}
        aria-label="Account"
        className={`inline-flex size-9 items-center justify-center transition-colors ${styles.ink} ${styles.ring} ${styles.readable}`}
      >
        <ProfileIcon className="size-5" />
      </Link>

      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className={`inline-flex size-9 items-center justify-center md:hidden ${styles.ink} ${styles.ring} ${styles.readable}`}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>

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
          className={`absolute top-0 right-0 flex h-full w-[min(20rem,86vw)] flex-col border-l shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out ${styles.drawer} ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex h-16 items-center justify-between px-5">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase">
              Menu
            </p>
            <button
              type="button"
              aria-label="Close menu"
              className={`inline-flex size-9 items-center justify-center ${styles.ring}`}
              onClick={() => setOpen(false)}
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1 px-3 pb-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="rounded-md px-3 py-3 text-sm font-semibold tracking-[0.14em] uppercase transition-colors hover:text-logo-gradient"
                onClick={() => setOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href={heroCopy.loginHref}
              className="mt-3 inline-flex items-center gap-2 rounded-md px-3 py-3 text-sm font-semibold tracking-[0.14em] uppercase transition-colors hover:text-logo-gradient"
              onClick={() => setOpen(false)}
            >
              <ProfileIcon className="size-4" />
              Account
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
