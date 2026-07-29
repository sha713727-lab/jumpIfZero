"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type DeferredMountProps = {
  readonly children: ReactNode;
  readonly fallback: ReactNode;
  readonly rootMargin?: string;
};

function refreshScrollTriggers() {
  void import("gsap/ScrollTrigger")
    .then(({ ScrollTrigger }) => {
      ScrollTrigger.refresh();
    })
    .catch(() => undefined);
}

export function DeferredMount({
  children,
  fallback,
  rootMargin = "320px 0px",
}: DeferredMountProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || visible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(root);

    return () => observer.disconnect();
  }, [rootMargin, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      refreshScrollTriggers();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [visible]);

  return <div ref={rootRef}>{visible ? children : fallback}</div>;
}
