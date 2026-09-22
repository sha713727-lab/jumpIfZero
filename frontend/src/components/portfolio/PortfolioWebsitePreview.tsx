"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type SyntheticEvent,
} from "react";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import {
  previewDurationMs,
  previewScrollDistance,
} from "@/components/portfolio/portfolioPreviewMath";

const DEFAULT_NATURAL_WIDTH = 1200;
const DEFAULT_NATURAL_HEIGHT = 2400;

type PortfolioWebsitePreviewProps = {
  readonly fullPageSrc: string;
  readonly fallbackSrc: string;
  readonly alt: string;
  readonly className?: string;
};

function subscribeReducedMotion(onStoreChange: () => void): () => void {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function subscribeCoarsePointer(onStoreChange: () => void): () => void {
  const media = window.matchMedia("(pointer: coarse)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getCoarsePointerSnapshot(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

function getCoarsePointerServerSnapshot(): boolean {
  return false;
}

export function PortfolioWebsitePreview({
  fullPageSrc,
  fallbackSrc,
  alt,
  className,
}: PortfolioWebsitePreviewProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [failed, setFailed] = useState(false);
  const [durationMs, setDurationMs] = useState(() => previewDurationMs(0));
  const [naturalSize, setNaturalSize] = useState({
    width: DEFAULT_NATURAL_WIDTH,
    height: DEFAULT_NATURAL_HEIGHT,
  });

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const coarsePointer = useSyncExternalStore(
    subscribeCoarsePointer,
    getCoarsePointerSnapshot,
    getCoarsePointerServerSnapshot,
  );

  const primarySrc =
    !failed && fullPageSrc.trim().length > 0
      ? cmsMediaSrc(fullPageSrc)
      : cmsMediaSrc(fallbackSrc);
  const canScroll =
    !reducedMotion && !coarsePointer && scrollDistance > 0 && !failed;

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const imageWrap = imageWrapRef.current;
    if (!viewport || !imageWrap) {
      return;
    }

    const containerHeight = viewport.clientHeight;
    const renderedHeight = imageWrap.getBoundingClientRect().height;
    const distance = previewScrollDistance(renderedHeight, containerHeight);
    setScrollDistance(distance);
    setDurationMs(previewDurationMs(distance));
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const imageWrap = imageWrapRef.current;
    if (!viewport || !imageWrap) {
      return;
    }

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(viewport);
    observer.observe(imageWrap);

    return () => {
      observer.disconnect();
    };
  }, [measure, primarySrc, naturalSize]);

  const frameClass =
    className ??
    "relative aspect-square w-full overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#e2e4de] shadow-[0_22px_50px_rgba(47,58,40,0.14)]";

  return (
    <div
      ref={viewportRef}
      className={frameClass}
      onMouseEnter={() => {
        if (canScroll) {
          setHovered(true);
        }
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      {primarySrc.length > 0 ? (
        <div
          ref={imageWrapRef}
          className="pointer-events-none absolute top-0 left-0 w-full select-none"
          style={{
            transform:
              canScroll && hovered
                ? `translate3d(0, -${scrollDistance}px, 0)`
                : "translate3d(0, 0, 0)",
            transitionProperty: "transform",
            transitionDuration: `${durationMs}ms`,
            transitionTimingFunction: "linear",
            willChange: canScroll ? "transform" : "auto",
          }}
        >
          <Image
            src={primarySrc}
            alt={alt}
            width={naturalSize.width}
            height={naturalSize.height}
            unoptimized
            sizes="(max-width: 768px) 100vw, 40vw"
            className="h-auto w-full max-w-none"
            onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
              const img = event.currentTarget;
              setNaturalSize({
                width: img.naturalWidth || DEFAULT_NATURAL_WIDTH,
                height: img.naturalHeight || DEFAULT_NATURAL_HEIGHT,
              });
              measure();
            }}
            onError={() => {
              if (!failed && fullPageSrc.trim().length > 0) {
                setFailed(true);
                return;
              }
              setFailed(true);
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[#e2e4de]" aria-hidden="true" />
      )}
    </div>
  );
}
