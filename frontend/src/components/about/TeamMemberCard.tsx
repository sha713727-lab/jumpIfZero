"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { TeamSocialNetwork } from "@/constants/team";

export type TeamMemberCardAccent = "brand" | "secondary" | "dark";

export type TeamMemberSocial = {
  readonly label: string;
  readonly href: string;
  readonly network: TeamSocialNetwork;
};

export type TeamMemberCardProps = {
  readonly position: "left" | "right";
  readonly jobPosition: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly imageUrl: string;
  readonly description: string;
  readonly accent?: TeamMemberCardAccent;
  readonly socials?: readonly TeamMemberSocial[];
  readonly onOpenDetail?: () => void;
  readonly className?: string;
};

const ACCENT = {
  brand: {
    role: "text-brand",
    first: "text-brand",
    last: "text-logo-gradient",
    body: "text-[#2f3a28]/80",
    bar: "bg-logo-gradient",
    cta: "border-secondary bg-logo-gradient text-black hover:border-brand hover:bg-brand hover:text-cream",
    socialLinkedin:
      "border-brand/30 bg-brand/10 text-brand hover:border-brand hover:bg-brand hover:text-cream",
    socialInstagram:
      "border-secondary/40 bg-secondary/15 text-[#2f3a28] hover:border-secondary hover:bg-logo-gradient hover:text-black",
    socialX:
      "border-[#2f3a28]/25 bg-[#2f3a28]/8 text-[#2f3a28] hover:border-[#2f3a28] hover:bg-[#2f3a28] hover:text-cream",
    frame: "ring-4 ring-brand/30",
    bloom: "bg-secondary/30",
  },
  secondary: {
    role: "text-logo-gradient",
    first: "text-logo-gradient",
    last: "text-brand",
    body: "text-[#2f3a28]/80",
    bar: "bg-brand",
    cta: "border-brand bg-brand text-cream hover:border-secondary hover:bg-logo-gradient hover:text-black",
    socialLinkedin:
      "border-brand/30 bg-brand/10 text-brand hover:border-brand hover:bg-brand hover:text-cream",
    socialInstagram:
      "border-secondary/50 bg-secondary/20 text-[#2f3a28] hover:border-secondary hover:bg-logo-gradient hover:text-black",
    socialX:
      "border-[#2f3a28]/25 bg-[#2f3a28]/8 text-[#2f3a28] hover:border-[#2f3a28] hover:bg-[#2f3a28] hover:text-cream",
    frame: "ring-4 ring-secondary/45",
    bloom: "bg-brand/25",
  },
  dark: {
    role: "text-[#2f3a28]",
    first: "text-[#2f3a28]",
    last: "text-logo-gradient",
    body: "text-black/60",
    bar: "bg-logo-gradient",
    cta: "border-secondary bg-logo-gradient text-black hover:border-[#2f3a28] hover:bg-[#2f3a28] hover:text-cream",
    socialLinkedin:
      "border-brand/30 bg-brand/10 text-brand hover:border-brand hover:bg-brand hover:text-cream",
    socialInstagram:
      "border-secondary/40 bg-secondary/15 text-[#2f3a28] hover:border-secondary hover:bg-logo-gradient hover:text-black",
    socialX:
      "border-[#2f3a28]/25 bg-[#2f3a28]/8 text-[#2f3a28] hover:border-[#2f3a28] hover:bg-[#2f3a28] hover:text-cream",
    frame: "ring-4 ring-[#2f3a28]/35",
    bloom: "bg-secondary/25",
  },
} as const;

function ArrowIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

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

function socialClass(
  network: TeamSocialNetwork,
  theme: (typeof ACCENT)[TeamMemberCardAccent],
): string {
  if (network === "linkedin") {
    return theme.socialLinkedin;
  }

  if (network === "instagram") {
    return theme.socialInstagram;
  }

  return theme.socialX;
}

export function TeamMemberCard({
  position,
  jobPosition,
  firstName,
  lastName,
  imageUrl,
  description,
  accent = "brand",
  socials = [],
  onOpenDetail,
  className,
}: TeamMemberCardProps) {
  const fullName = `${firstName} ${lastName}`.trim();
  const isRight = position === "right";
  const theme = ACCENT[accent];
  const rootClass = className
    ? `relative my-12 flex flex-col justify-center md:my-20 ${className}`
    : "relative my-12 flex flex-col justify-center md:my-20";

  return (
    <motion.article
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={rootClass}
    >
      <motion.p
        initial={{ opacity: 0, x: isRight ? 20 : -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={
          isRight
            ? `mb-4 text-right text-[0.7rem] font-extrabold tracking-[0.22em] uppercase ${theme.role}`
            : `mb-4 text-[0.7rem] font-extrabold tracking-[0.22em] uppercase ${theme.role}`
        }
      >
        {jobPosition}
      </motion.p>

      <div
        className={
          isRight
            ? "flex flex-col items-center md:flex-row-reverse md:items-center md:justify-end"
            : "flex flex-col items-center md:flex-row md:items-center md:justify-end"
        }
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className={`relative h-[22rem] w-full max-w-[22.5rem] shrink-0 overflow-hidden rounded-[1.75rem] bg-[#e2e4de] shadow-[0_18px_40px_rgba(47,58,40,0.12)] md:h-[31.25rem] md:w-[22.5rem] ${theme.frame}`}
        >
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -top-10 -right-8 z-[5] size-36 rounded-full blur-3xl ${theme.bloom}`}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_top,rgba(13,18,11,0.22)_0%,transparent_48%)]"
          />
          <Image
            src={imageUrl}
            alt={fullName}
            fill
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
            sizes="(max-width: 768px) 90vw, 360px"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: isRight ? -32 : 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={
            isRight
              ? "relative z-[2] mt-6 flex w-full flex-col items-end gap-8 md:mt-0 md:-mr-8 md:w-[calc(100%-20rem)] md:gap-12 lg:w-[calc(100%-22.5rem)]"
              : "relative z-[2] mt-6 flex w-full flex-col gap-8 md:mt-0 md:-ml-8 md:w-[calc(100%-20rem)] md:gap-12 lg:w-[calc(100%-22.5rem)]"
          }
        >
          <div className={isRight ? "text-right" : undefined}>
            <div
              aria-hidden="true"
              className={`mb-5 h-1.5 w-14 rounded-full ${theme.bar}`}
            />
            <h3 className="text-[clamp(2.4rem,5vw,3.5rem)] leading-[1.08] font-extrabold tracking-[-0.04em]">
              <span className={theme.first}>{firstName}</span>
              {lastName ? (
                <>
                  <br />
                  <span className={theme.last}>{lastName}</span>
                </>
              ) : null}
            </h3>
          </div>

          <div
            className={
              isRight
                ? "flex flex-col items-end gap-6 md:flex-row md:justify-end md:gap-8"
                : "flex flex-col gap-6 md:flex-row md:gap-8"
            }
          >
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }}>
              <button
                type="button"
                onClick={onOpenDetail}
                aria-label={`View details for ${fullName}`}
                className={`group flex size-16 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none md:size-20 ${theme.cta}`}
              >
                <ArrowIcon
                  className={
                    isRight
                      ? "size-5 rotate-180 transition-transform duration-300 group-hover:rotate-[225deg] md:size-[22px]"
                      : "size-5 transition-transform duration-300 group-hover:-rotate-45 md:size-[22px]"
                  }
                />
              </button>
            </motion.div>

            <p
              className={
                isRight
                  ? `max-w-[18rem] text-right text-[0.9rem] leading-[1.7] font-medium md:max-w-[42%] ${theme.body}`
                  : `max-w-[18rem] text-[0.9rem] leading-[1.7] font-medium md:max-w-[42%] ${theme.body}`
              }
            >
              {description}
            </p>
          </div>

          {socials.length > 0 ? (
            <div className={isRight ? "flex justify-end gap-3" : "flex gap-3"}>
              {socials.map((social) => (
                <Link
                  key={social.network}
                  href={social.href}
                  aria-label={`${fullName} on ${social.label}`}
                  className={`flex size-10 items-center justify-center rounded-full border transition-all duration-300 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none ${socialClass(social.network, theme)}`}
                >
                  <SocialIcon network={social.network} />
                </Link>
              ))}
            </div>
          ) : null}
        </motion.div>
      </div>
    </motion.article>
  );
}
