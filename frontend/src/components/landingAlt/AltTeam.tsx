"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { teamIntro, teamMembers } from "@/lib/data/team";
import type { TeamSocialNetwork } from "@/lib/data/team";
import { applyHeaderTone } from "@/lib/headerTone";
import styles from "./landingAlt.module.css";

gsap.registerPlugin(ScrollTrigger);

const HEADER_HEIGHT = 72;
const SECTION_BG = "#f7f5f0";
const TILT_ANGLE = 8;
const TILT_PERSPECTIVE = 900;
const STACK_DEPTH = 3;
const SWIPE_THRESHOLD = 110;
const AUTOPLAY_MS = 3200;

const CARD_THEMES = {
  brand: {
    surface: "border-white/10 bg-brand",
    bloom: "bg-white/10",
  },
  secondary: {
    surface: "border-black/10 bg-logo-gradient",
    bloom: "bg-white/25",
  },
  dark: {
    surface: "border-white/10 bg-[#0d120b]",
    bloom: "bg-brand/30",
  },
} as const;

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

function stackTransform(depth: number, dragX: number): string {
  if (depth < 0) {
    const fly = Math.min(Math.abs(dragX) + 280, 420);
    return `translate3d(calc(-50% + ${dragX < 0 ? -fly : fly}px), 0, 0) rotate(${dragX < 0 ? -14 : 14}deg) scale(0.92)`;
  }

  if (depth === 0) {
    const rotate = dragX * 0.05;
    return `translate3d(calc(-50% + ${dragX}px), 0, 0) rotate(${rotate}deg) scale(0.92)`;
  }

  const layer = Math.min(depth, STACK_DEPTH);
  const scale = 0.92 + layer * 0.06;
  return `translate3d(-50%, 0, ${-layer * 36}px) scale(${scale})`;
}

function TeamCardBody({
  name,
  role,
  image,
  bloom,
  socials,
}: {
  readonly name: string;
  readonly role: string;
  readonly image: string;
  readonly bloom: string;
  readonly socials: (typeof teamMembers)[number]["socials"];
}) {
  return (
    <>
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 1023px) 90vw, 30vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        draggable={false}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(13,18,11,0.82)_100%)]"
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-16 -right-12 size-40 rounded-full opacity-70 transition-opacity duration-500 group-hover:opacity-100 ${bloom}`}
      />

      <div className="absolute inset-x-0 bottom-0 p-6 text-left md:p-7">
        <h3 className="text-[1.25rem] leading-tight font-extrabold tracking-[-0.02em] text-cream">
          {name}
        </h3>
        <p className="mt-2 text-[0.66rem] font-bold tracking-[0.24em] text-logo-gradient uppercase">
          {role}
        </p>

        <div className="mt-5 flex items-center gap-2.5">
          {socials.map((social) => (
            <Link
              key={social.network}
              href={social.href}
              aria-label={`${name} on ${social.label}`}
              className="flex size-9 items-center justify-center rounded-full border border-cream/25 text-cream transition-all duration-300 hover:border-secondary hover:bg-logo-gradient hover:text-black focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <SocialIcon network={social.network} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export function AltTeam() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const deckCardsRef = useRef<Array<HTMLElement | null>>([]);
  const gridCardsRef = useRef<Array<HTMLElement | null>>([]);
  const activeRef = useRef(0);
  const dragRef = useRef({ active: false, startX: 0, offset: 0 });
  const pausedRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const offscreenRef = useRef(false);
  const [active, setActive] = useState(0);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  const applyLayout = useCallback((index: number, dragX: number) => {
    deckCardsRef.current.forEach((node, cardIndex) => {
      if (!node) {
        return;
      }

      const depth = cardIndex - index;
      node.style.transform = stackTransform(depth, dragX);
      node.style.opacity = depth > STACK_DEPTH ? "0" : depth < 0 ? "0" : "1";
      node.style.pointerEvents = depth === 0 ? "auto" : "none";
      node.style.zIndex = String(teamMembers.length - Math.max(depth, -1));
    });
  }, []);

  const goTo = useCallback((index: number) => {
    const total = teamMembers.length;
    const next = ((index % total) + total) % total;
    activeRef.current = next;
    setActive(next);
  }, []);

  useEffect(() => {
    applyLayout(active, 0);
  }, [active, applyLayout]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const syncHeader = () => {
      const rect = section.getBoundingClientRect();

      if (rect.top > HEADER_HEIGHT || rect.bottom <= HEADER_HEIGHT) {
        return;
      }

      applyHeaderTone(true, SECTION_BG);
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", syncHeader);

    return () => {
      window.removeEventListener("scroll", syncHeader);
      window.removeEventListener("resize", syncHeader);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);

    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        offscreenRef.current = !entries.some((entry) => entry.isIntersecting);
      },
      { rootMargin: "120px 0px", threshold: 0.05 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      if (
        pausedRef.current ||
        offscreenRef.current ||
        dragRef.current.active ||
        isDesktop
      ) {
        return;
      }

      goTo(activeRef.current + 1);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [goTo, isDesktop]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotionRef.current) {
      applyLayout(0, 0);
      return;
    }

    const gridCards = gridCardsRef.current.filter(
      (node): node is HTMLElement => node !== null,
    );

    const ctx = gsap.context(() => {
      if (deckRef.current) {
        gsap.fromTo(
          deckRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      if (gridCards.length > 0) {
        gsap.from(gridCards, {
          y: 64,
          opacity: 0,
          rotateX: 12,
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: section,
            start: "top 68%",
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, [applyLayout]);

  const handleDragStart = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("a")) {
      return;
    }

    const node = event.currentTarget;
    pausedRef.current = true;
    dragRef.current = { active: true, startX: event.clientX, offset: 0 };
    node.dataset.dragging = "true";
    node.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragRef.current.active) {
      return;
    }

    dragRef.current.offset = event.clientX - dragRef.current.startX;
    applyLayout(activeRef.current, dragRef.current.offset);
  };

  const handleDragEnd = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragRef.current.active) {
      return;
    }

    const node = event.currentTarget;
    const { offset } = dragRef.current;
    dragRef.current.active = false;
    delete node.dataset.dragging;

    if (node.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }

    if (offset <= -SWIPE_THRESHOLD) {
      goTo(activeRef.current + 1);
    } else if (offset >= SWIPE_THRESHOLD) {
      goTo(activeRef.current - 1);
    } else {
      applyLayout(activeRef.current, 0);
    }

    window.setTimeout(() => {
      pausedRef.current = false;
    }, AUTOPLAY_MS);
  };

  const handleTilt = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotionRef.current) {
      return;
    }

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
    const ratioY = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(card, {
      rotateY: ratioX * TILT_ANGLE,
      rotateX: -ratioY * TILT_ANGLE,
      transformPerspective: TILT_PERSPECTIVE,
      duration: 0.4,
      ease: "power3.out",
      force3D: true,
    });
  };

  const handleTiltReset = (event: ReactPointerEvent<HTMLElement>) => {
    gsap.to(event.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.55,
      ease: "power3.out",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="team"
      aria-label="Our team"
      data-header-tone="light"
      data-header-bg="#f7f5f0"
      className="relative overflow-hidden bg-cream py-28 md:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(249,161,55,0.12)_0%,transparent_58%)]"
      />

      <div className="relative mx-auto w-full max-w-[1360px] px-5 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative mx-auto flex items-center justify-center py-6">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(2.4rem,8vw,5.5rem)] font-extrabold tracking-[0.08em] whitespace-nowrap text-logo-gradient opacity-20 uppercase select-none"
            >
              {teamIntro.watermark}
            </span>
            <h2 className="relative z-[1] text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
              {teamIntro.title}
            </h2>
          </div>

          <div className="mx-auto mt-2 max-w-xl space-y-2">
            {teamIntro.lines.map((line) => (
              <p
                key={line}
                className="text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-black/55 italic"
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {isDesktop === null ? (
          <div className="mt-16 h-[30rem] lg:h-auto lg:min-h-[28rem]" aria-hidden="true" />
        ) : null}

        {isDesktop === false ? (
          <div
            ref={deckRef}
            className="mt-16 flex flex-col items-center"
            onPointerEnter={() => {
              pausedRef.current = true;
            }}
            onPointerLeave={() => {
              if (!dragRef.current.active) {
                pausedRef.current = false;
              }
            }}
          >
          <div
            className={`relative h-[30rem] w-[min(100%,19.5rem)] ${styles.deckStage}`}
          >
            {teamMembers.map((member, index) => {
              const theme = CARD_THEMES[member.accent];

              return (
                <article
                  key={member.name}
                  ref={(node) => {
                    deckCardsRef.current[index] = node;
                  }}
                  aria-hidden={index !== active}
                  onPointerDown={handleDragStart}
                  onPointerMove={handleDragMove}
                  onPointerUp={handleDragEnd}
                  onPointerCancel={handleDragEnd}
                  className={`group absolute bottom-0 left-1/2 h-[26rem] w-[16.5rem] cursor-grab overflow-hidden rounded-[1.75rem] border shadow-[0_28px_60px_rgba(47,58,40,0.22)] select-none active:cursor-grabbing ${theme.surface} ${styles.deckCard} ${styles.teamDeckCard}`}
                >
                  <TeamCardBody
                    name={member.name}
                    role={member.role}
                    image={member.image}
                    bloom={theme.bloom}
                    socials={member.socials}
                  />
                </article>
              );
            })}
          </div>

          <div className="mt-10 flex items-center gap-5">
            <button
              type="button"
              aria-label="Previous team member"
              onClick={() => goTo(active - 1)}
              className="flex size-11 items-center justify-center rounded-full border border-brand/25 text-brand transition-colors duration-300 hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              <span aria-hidden="true">←</span>
            </button>

            <div className="flex items-center gap-2">
              {teamMembers.map((member, index) => (
                <button
                  key={member.name}
                  type="button"
                  aria-label={member.name}
                  aria-current={index === active}
                  onClick={() => goTo(index)}
                  className={`h-1 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${
                    index === active
                      ? "w-10 bg-brand"
                      : "w-4 bg-brand/20 hover:bg-brand/40"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Next team member"
              onClick={() => goTo(active + 1)}
              className="flex size-11 items-center justify-center rounded-full border border-brand/25 text-brand transition-colors duration-300 hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        ) : null}

        {isDesktop === true ? (
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {teamMembers.map((member, index) => {
            const theme = CARD_THEMES[member.accent];

            return (
              <article
                key={member.name}
                ref={(node) => {
                  gridCardsRef.current[index] = node;
                }}
                onPointerMove={handleTilt}
                onPointerLeave={handleTiltReset}
                className={`group relative aspect-[3/4] overflow-hidden rounded-[1.75rem] border shadow-[0_22px_50px_rgba(47,58,40,0.14)] transition-shadow duration-500 hover:shadow-[0_32px_70px_rgba(47,58,40,0.22)] ${theme.surface} ${styles.tiltCard}`}
              >
                <div className={`absolute inset-0 ${styles.tiltInner}`}>
                  <TeamCardBody
                    name={member.name}
                    role={member.role}
                    image={member.image}
                    bloom={theme.bloom}
                    socials={member.socials}
                  />
                </div>
              </article>
            );
          })}
        </div>
        ) : null}
      </div>
    </section>
  );
}
