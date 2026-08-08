"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const drawerId = useId();
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        menuButtonRef.current?.focus();
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const closeMenu = () => {
    menuButtonRef.current?.focus();
    setOpen(false);
  };

  const drawer =
    mounted &&
    createPortal(
      <div
        className={`fixed inset-0 z-[100] lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        {...(open ? {} : { inert: true })}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close menu overlay"
          className={`absolute inset-0 bg-[#0d120b]/55 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={closeMenu}
        />
        <aside
          id={drawerId}
          role="dialog"
          aria-modal={open}
          aria-label="Site menu"
          className={`${styles.drawer} absolute inset-y-0 right-0 flex h-[100dvh] w-[min(22rem,100%)] flex-col shadow-[0_0_48px_rgba(13,18,11,0.28)] transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div
            className={`${styles.drawerHeader} flex h-16 shrink-0 items-center justify-between border-b px-6`}
          >
            <p className="text-[0.7rem] font-extrabold tracking-[0.22em] uppercase">
              Menu
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              tabIndex={open ? 0 : -1}
              aria-label="Close menu"
              className={`inline-flex size-10 items-center justify-center rounded-lg ${styles.ring}`}
              onClick={closeMenu}
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <nav
            aria-label="Mobile"
            className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-4 py-5"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                tabIndex={open ? 0 : -1}
                className={`${styles.drawerLink} rounded-xl px-4 py-3.5 text-[0.95rem] font-extrabold tracking-[0.16em] uppercase transition-colors`}
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            ))}

            <div className={`${styles.drawerDivider} my-3 mx-4`} />

            <Link
              href={heroCopy.loginHref}
              tabIndex={open ? 0 : -1}
              className={`${styles.drawerLink} inline-flex items-center gap-3 rounded-xl px-4 py-3.5 text-[0.95rem] font-extrabold tracking-[0.16em] uppercase transition-colors`}
              onClick={closeMenu}
            >
              <ProfileIcon className="size-5 shrink-0" />
              Account
            </Link>
          </nav>
        </aside>
      </div>,
      document.body,
    );

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
        ref={menuButtonRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={drawerId}
        className={`inline-flex size-9 items-center justify-center lg:hidden ${styles.ink} ${styles.ring} ${styles.readable}`}
        onClick={() => {
          if (open) {
            closeMenu();
            return;
          }
          setOpen(true);
        }}
      >
        {open ? (
          <CloseIcon className="size-5" />
        ) : (
          <MenuIcon className="size-5" />
        )}
      </button>

      {drawer}
    </>
  );
}
