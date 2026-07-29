import { applyHeaderTone } from "@/lib/headerTone";

const HEADER_HEIGHT = 72;

export function syncHeaderFromSections(
  fallbackLight = false,
  fallbackBg = "#74815f",
): void {
  const nodes = document.querySelectorAll<HTMLElement>(
    "[data-header-tone][data-header-bg]",
  );

  for (const element of nodes) {
    const rect = element.getBoundingClientRect();

    if (rect.top > HEADER_HEIGHT || rect.bottom <= HEADER_HEIGHT) {
      continue;
    }

    const bg = element.dataset.headerBg;

    if (!bg) {
      continue;
    }

    applyHeaderTone(element.dataset.headerTone === "light", bg);
    return;
  }

  applyHeaderTone(fallbackLight, fallbackBg);
}

export function bindHeaderSectionSync(
  fallbackLight = false,
  fallbackBg = "#74815f",
): () => void {
  const sync = () => syncHeaderFromSections(fallbackLight, fallbackBg);
  sync();
  window.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);

  return () => {
    window.removeEventListener("scroll", sync);
    window.removeEventListener("resize", sync);
  };
}
