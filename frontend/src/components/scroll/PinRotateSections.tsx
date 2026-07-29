"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

export type PinRotateIntroProps = {
  readonly className?: string;
  readonly children: ReactNode;
};

export function PinRotateIntro({ className, children }: PinRotateIntroProps) {
  return (
    <section
      data-pin-rotate-intro
      className={
        className
          ? `flex min-h-screen flex-col items-center justify-center bg-brand px-[8vw] py-0 text-center text-cream ${className}`
          : "flex min-h-screen flex-col items-center justify-center bg-brand px-[8vw] py-0 text-center text-cream"
      }
    >
      {children}
    </section>
  );
}

export type PinRotateSectionProps = {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children: ReactNode;
};

export function PinRotateSection({
  className,
  style,
  children,
}: PinRotateSectionProps) {
  return (
    <section
      data-pin-rotate-section
      className="sticky top-0 flex min-h-[100svh] w-full items-stretch"
      style={style}
    >
      <div
        className={
          className
            ? `relative flex min-h-[100svh] w-full flex-col justify-center border-b border-black/15 px-[6vw] py-[8vh] md:flex-row md:items-center md:justify-between md:gap-10 md:px-[8vw] md:py-[10vh] ${className}`
            : "relative flex min-h-[100svh] w-full flex-col justify-center border-b border-black/15 bg-cream px-[6vw] py-[8vh] md:flex-row md:items-center md:justify-between md:gap-10 md:px-[8vw] md:py-[10vh]"
        }
      >
        <div className="relative z-[1] flex w-full flex-col md:flex-row md:items-center md:justify-between md:gap-10">
          {children}
        </div>
      </div>
    </section>
  );
}

export type PinRotateOutroProps = {
  readonly className?: string;
  readonly children: ReactNode;
};

export function PinRotateOutro({ className, children }: PinRotateOutroProps) {
  return (
    <section
      data-pin-rotate-outro
      className={
        className
          ? `flex min-h-screen flex-col items-center justify-center bg-brand px-[6vw] py-0 text-center text-cream md:px-[8vw] ${className}`
          : "flex min-h-screen flex-col items-center justify-center bg-brand px-[6vw] py-0 text-center text-cream md:px-[8vw]"
      }
    >
      {children}
    </section>
  );
}

type PinRotateSectionsProps = {
  readonly children: ReactNode;
  readonly className?: string;
};

export function PinRotateSections({
  children,
  className,
}: PinRotateSectionsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>("[data-pin-rotate-section]"),
    );

    sections.forEach((section, index) => {
      section.style.zIndex = String(index + 1);
      section.style.transform = "";
      section.style.filter = "";
      section.style.opacity = "";
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={
        className ? `relative w-full ${className}` : "relative w-full"
      }
    >
      {children}
    </div>
  );
}
