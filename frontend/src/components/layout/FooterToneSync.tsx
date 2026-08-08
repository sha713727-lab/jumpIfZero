"use client";

import { useEffect } from "react";
import { applyHeaderTone } from "@/lib/headerTone";

const HEADER_HEIGHT = 72;
const SECTION_BG = "#5c6849";

export function FooterToneSync() {
  useEffect(() => {
    const footer = document.getElementById("site-footer");

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

  return null;
}
