function scrollToTopImmediate(): void {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function clearBodyScrollLock(): void {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

export async function resetScrollOnRouteChange(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  clearBodyScrollLock();
  scrollToTopImmediate();

  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  ScrollTrigger.getAll().forEach((trigger) => {
    trigger.kill(true);
  });
  ScrollTrigger.clearScrollMemory?.();
}

export async function resetScrollOnSameRoute(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  clearBodyScrollLock();
  scrollToTopImmediate();

  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  ScrollTrigger.refresh();
}

export function normalizePathname(pathname: string): string {
  if (pathname.length <= 1) {
    return "/";
  }

  return pathname.replace(/\/$/, "") || "/";
}

export function isSameRouteLink(
  href: string,
  currentPathname: string,
): boolean {
  if (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return false;
  }

  let url: URL;

  try {
    url = new URL(href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin || url.hash.length > 0) {
    return false;
  }

  return normalizePathname(url.pathname) === normalizePathname(currentPathname);
}
