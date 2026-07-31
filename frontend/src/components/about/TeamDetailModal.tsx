"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useId,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import type { TeamMember, TeamSocialNetwork } from "@/lib/data/team";
import { useModalFocus } from "@/lib/useModalFocus";

type TeamDetailModalProps = {
  readonly member: TeamMember | null;
  readonly onClose: () => void;
};

function SocialIcon({ network }: { readonly network: TeamSocialNetwork }) {
  if (network === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M6.94 8.5H4.1V19.5h2.84V8.5ZM5.52 4.5A1.65 1.65 0 1 0 5.52 7.8 1.65 1.65 0 0 0 5.52 4.5ZM20.1 19.5h-2.83v-5.58c0-1.33-.48-2.24-1.68-2.24-.92 0-1.46.62-1.7 1.21-.09.22-.11.52-.11.83V19.5h-2.84s.04-9.55 0-10.54h2.84v1.49c.38-.58 1.05-1.41 2.56-1.41 1.87 0 3.27 1.22 3.27 3.85V19.5Z"
        />
      </svg>
    );
  }

  if (network === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 8.2A3.8 3.8 0 1 0 12 15.8 3.8 3.8 0 0 0 12 8.2Zm0 6.25A2.45 2.45 0 1 1 12 9.55a2.45 2.45 0 0 1 0 4.9Zm4.94-6.52a.89.89 0 1 1-1.78 0 .89.89 0 0 1 1.78 0ZM12 3.5c-2.45 0-2.76.01-3.72.05-2.4.11-3.52 1.24-3.63 3.63-.04.96-.05 1.27-.05 3.72s.01 2.76.05 3.72c.11 2.39 1.23 3.52 3.63 3.63.96.04 1.27.05 3.72.05s2.76-.01 3.72-.05c2.4-.11 3.52-1.24 3.63-3.63.04-.96.05-1.27.05-3.72s-.01-2.76-.05-3.72c-.11-2.39-1.23-3.52-3.63-3.63C14.76 3.51 14.45 3.5 12 3.5Zm0 1.35c2.4 0 2.69.01 3.63.05 1.8.08 2.64.93 2.72 2.72.04.94.05 1.23.05 3.63s-.01 2.69-.05 3.63c-.08 1.79-.92 2.64-2.72 2.72-.94.04-1.23.05-3.63.05s-2.69-.01-3.63-.05c-1.8-.08-2.64-.93-2.72-2.72-.04-.94-.05-1.23-.05-3.63s.01-2.69.05-3.63c.08-1.79.92-2.64 2.72-2.72.94-.04 1.23-.05 3.63-.05Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.24 3.5h2.84l-6.21 7.1L22.1 20.5h-5.55l-4.34-5.68L7.1 20.5H4.25l6.64-7.59L2.1 3.5h5.69l3.92 5.2L18.24 3.5Zm-1 15.3h1.57L7.05 5.1H5.36l11.88 13.7Z"
      />
    </svg>
  );
}

export function TeamDetailModal({ member, onClose }: TeamDetailModalProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const open = member !== null;

  useModalFocus({
    open,
    containerRef,
    initialFocusRef: closeRef,
    onClose,
  });

  if (!open || !member || typeof document === "undefined") {
    return null;
  }

  const onBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={containerRef}
      role="presentation"
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(13,18,11,0.72)] p-0 backdrop-blur-[6px] sm:items-center sm:p-6 md:p-10"
      onClick={onBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[100svh] w-full max-w-[980px] flex-col overflow-hidden bg-cream text-black shadow-[0_40px_120px_rgba(13,18,11,0.45)] sm:max-h-[min(92svh,820px)] sm:rounded-[2.25rem]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_0%_0%,rgba(249,161,55,0.14)_0%,transparent_55%),radial-gradient(ellipse_45%_50%_at_100%_0%,rgba(116,129,95,0.18)_0%,transparent_50%)]"
        />

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close team member details"
          className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-cream/90 text-black transition-colors hover:border-black/25 hover:bg-white focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none md:top-6 md:right-6"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </button>

        <div className="relative grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative min-h-[260px] overflow-hidden bg-[#e2e4de] sm:min-h-[320px] lg:min-h-full">
            <Image
              src={member.image}
              alt={member.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
              priority
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,18,11,0.08)_0%,rgba(13,18,11,0.58)_100%)]"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="text-[0.66rem] font-extrabold tracking-[0.28em] text-logo-gradient uppercase">
                Team
              </p>
              <p className="mt-2 text-[clamp(1.45rem,3vw,2.1rem)] leading-none font-extrabold tracking-[-0.03em] text-cream">
                {member.name}
              </p>
              <p className="mt-3 text-[0.72rem] font-extrabold tracking-[0.18em] text-cream/70 uppercase">
                {member.role}
              </p>
            </div>
          </div>

          <div className="relative flex flex-col px-6 py-8 md:px-10 md:py-12 lg:px-12">
            <p className="text-[0.66rem] font-extrabold tracking-[0.22em] text-logo-gradient uppercase">
              Member detail
            </p>

            <h2
              id={titleId}
              className="mt-4 max-w-xl text-[clamp(1.55rem,3.2vw,2.35rem)] leading-[1.12] font-extrabold tracking-[-0.035em] text-black"
            >
              {member.name}
            </h2>
            <p className="mt-2 text-[0.78rem] font-extrabold tracking-[0.18em] text-brand uppercase">
              {member.role}
            </p>

            <p className="mt-5 max-w-md text-[clamp(0.95rem,1.8vw,1.08rem)] leading-[1.55] font-medium text-[#2f3a28]/70 italic">
              “{member.description}”
            </p>

            <p className="mt-6 max-w-lg text-[0.95rem] leading-[1.65] font-medium text-black/60">
              {member.focus}
            </p>

            <ul className="mt-8 space-y-3 border-t border-black/10 pt-8">
              {member.highlights.map((item) => (
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

            {member.socials.length > 0 ? (
              <div className="mt-8 flex gap-3">
                {member.socials.map((social) => (
                  <Link
                    key={social.network}
                    href={social.href}
                    aria-label={`${member.name} on ${social.label}`}
                    className="flex size-10 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-brand transition-colors hover:border-brand hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
                  >
                    <SocialIcon network={social.network} />
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-logo-gradient px-7 py-3.5 text-[0.66rem] font-extrabold tracking-[0.16em] text-black uppercase transition-colors hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              >
                Start engagement
                <span aria-hidden="true">→</span>
              </Link>
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
