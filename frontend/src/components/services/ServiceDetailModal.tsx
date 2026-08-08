"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { ServiceDetail } from "@/constants/serviceDetails";
import { MagneticLink } from "@/components/landingAlt/MagneticLink";
import { useModalFocus } from "@/lib/useModalFocus";

type ServiceDetailModalProps = {
  readonly detail: ServiceDetail | null;
  readonly onClose: () => void;
};

export function ServiceDetailModal({
  detail,
  onClose,
}: ServiceDetailModalProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const open = detail !== null;

  useModalFocus({
    open,
    containerRef,
    initialFocusRef: closeRef,
    onClose,
  });

  if (!open || !detail || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(13,18,11,0.72)] p-0 backdrop-blur-[6px] sm:items-center sm:p-6 md:p-10"
    >
      <button
        type="button"
        aria-label="Close service details"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[100svh] w-full max-w-[1080px] flex-col overflow-hidden bg-cream text-black shadow-[0_40px_120px_rgba(13,18,11,0.45)] sm:max-h-[min(92svh,880px)] sm:rounded-[2.25rem]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_0%_0%,rgba(249,161,55,0.14)_0%,transparent_55%),radial-gradient(ellipse_45%_50%_at_100%_0%,rgba(92, 104, 73,0.18)_0%,transparent_50%)]"
        />

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close service details"
          className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-cream/90 text-black transition-colors hover:border-black/25 hover:bg-white focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none md:top-6 md:right-6"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </button>

        <div className="relative grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="relative min-h-[240px] overflow-hidden bg-[#e2e4de] sm:min-h-[300px] lg:min-h-full">
            <Image
              src={detail.image}
              alt={detail.category}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 44vw"
              priority
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,18,11,0.08)_0%,rgba(13,18,11,0.55)_100%)]"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="text-[0.66rem] font-extrabold tracking-[0.28em] text-logo-gradient uppercase">
                Service
              </p>
              <p className="mt-2 text-[clamp(1.35rem,3vw,2rem)] leading-none font-extrabold tracking-[-0.03em] text-cream">
                {detail.category}
              </p>
            </div>
          </div>

          <div className="relative flex flex-col px-6 py-8 md:px-10 md:py-12 lg:px-12">
            <p className="text-[0.66rem] font-extrabold tracking-[0.22em] text-logo-gradient uppercase">
              Engagement detail
            </p>

            <h2
              id={titleId}
              className="mt-4 max-w-xl text-[clamp(1.55rem,3.2vw,2.35rem)] leading-[1.12] font-extrabold tracking-[-0.035em] text-black"
            >
              {detail.title}
            </h2>

            <p className="mt-5 max-w-md text-[clamp(0.95rem,1.8vw,1.08rem)] leading-[1.55] font-medium text-[#2f3a28]/70 italic">
              “{detail.quote}”
            </p>

            <p className="mt-6 max-w-lg text-[0.95rem] leading-[1.65] font-medium text-black/60">
              {detail.body}
            </p>

            <ul className="mt-8 space-y-3 border-t border-black/10 pt-8">
              {detail.highlights.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[0.92rem] leading-[1.5] font-medium text-[#2f3a28]/85"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-logo-gradient"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <MagneticLink
                href={detail.ctaHref}
                className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-logo-gradient px-7 py-3.5 text-[0.66rem] font-extrabold tracking-[0.16em] text-black uppercase hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              >
                {detail.ctaLabel}
                <span aria-hidden="true">→</span>
              </MagneticLink>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-black/15 px-6 py-3.5 text-[0.66rem] font-extrabold tracking-[0.16em] text-black/70 uppercase transition-colors hover:border-black/30 hover:text-black focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
