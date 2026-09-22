"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "@/components/layout/siteHeader.module.css";
import { serviceNavCategories } from "@/constants/servicesNav";

const CLOSE_DELAY_MS = 140;

function ChevronIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function HeaderServicesNav() {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(false);
  }, [clearCloseTimer]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      const panel = panelRef.current;
      if (!(event.target instanceof Node)) {
        return;
      }
      const inRoot = root?.contains(event.target) ?? false;
      const inPanel = panel?.contains(event.target) ?? false;
      if (!inRoot && !inPanel) {
        closeMenu();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeMenu]);

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "ArrowDown" || event.key === " ") {
      event.preventDefault();
      openMenu();
    }
  };

  const panel =
    mounted &&
    createPortal(
      <div
        ref={panelRef}
        id={panelId}
        className={`${styles.servicesPanel} ${open ? styles.servicesPanelOpen : ""}`}
        role="region"
        aria-label="Services menu"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        {...(open ? {} : { inert: true })}
      >
        <div className={styles.servicesPanelInner}>
          <ul className={styles.servicesGrid}>
            {serviceNavCategories.map((category) => (
              <li key={category.slug} className={styles.servicesColumn}>
                <Link
                  href={category.href}
                  className={`${styles.servicesCategory} ${styles.ring}`}
                  tabIndex={open ? 0 : -1}
                  onClick={closeMenu}
                >
                  {category.title}
                </Link>
                <ul className={styles.servicesChildren}>
                  {category.children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={child.href}
                        className={`${styles.servicesChild} ${styles.ring}`}
                        tabIndex={open ? 0 : -1}
                        onClick={closeMenu}
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>,
      document.body,
    );

  return (
    <div
      ref={rootRef}
      className={styles.servicesRoot}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocusCapture={openMenu}
      onBlurCapture={(event) => {
        const root = rootRef.current;
        const panelNode = panelRef.current;
        const next = event.relatedTarget;
        if (!(next instanceof Node)) {
          scheduleClose();
          return;
        }
        if (root?.contains(next) || panelNode?.contains(next)) {
          return;
        }
        scheduleClose();
      }}
    >
      <Link
        href="/services"
        className={`${styles.navLink} ${styles.servicesTrigger} ${styles.ink} ${styles.ring} ${styles.readable} ${open ? styles.servicesTriggerOpen : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onKeyDown={onTriggerKeyDown}
      >
        <span>Services</span>
        <ChevronIcon
          className={`${styles.servicesChevron} ${open ? styles.servicesChevronOpen : ""}`}
        />
      </Link>
      {panel}
    </div>
  );
}
