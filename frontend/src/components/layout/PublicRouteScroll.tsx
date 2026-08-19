"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import {
  isSameRouteLink,
  resetScrollOnRouteChange,
  resetScrollOnSameRoute,
} from "@/lib/resetScrollNavigation";

export function PublicRouteScroll() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const isFirstRoute = useRef(true);

  useLayoutEffect(() => {
    pathnameRef.current = pathname;

    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }

    void resetScrollOnRouteChange();
  }, [pathname]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");

      if (!anchor || anchor.target === "_blank") {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || !isSameRouteLink(href, pathnameRef.current)) {
        return;
      }

      event.preventDefault();
      void resetScrollOnSameRoute();
    };

    document.addEventListener("click", onDocumentClick, true);

    return () => {
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, []);

  return null;
}
