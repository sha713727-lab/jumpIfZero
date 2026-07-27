"use client";

import Link from "next/link";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import gsap from "gsap";

const MAGNET_STRENGTH = 0.34;
const MAGNET_LIMIT = 16;
const MAGNET_IN = 0.4;
const MAGNET_OUT = 0.75;

function clamp(value: number, limit: number): number {
  return Math.min(limit, Math.max(-limit, value));
}

type MagneticLinkProps = {
  readonly href: string;
  readonly className?: string;
  readonly children: ReactNode;
};

export function MagneticLink({ href, className, children }: MagneticLinkProps) {
  const handleMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const deltaX = event.clientX - (rect.left + rect.width / 2);
    const deltaY = event.clientY - (rect.top + rect.height / 2);

    gsap.to(target, {
      x: clamp(deltaX * MAGNET_STRENGTH, MAGNET_LIMIT),
      y: clamp(deltaY * MAGNET_STRENGTH, MAGNET_LIMIT),
      duration: MAGNET_IN,
      ease: "power3.out",
    });
  };

  const handleLeave = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    gsap.to(event.currentTarget, {
      x: 0,
      y: 0,
      duration: MAGNET_OUT,
      ease: "elastic.out(1, 0.45)",
    });
  };

  return (
    <Link
      href={href}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </Link>
  );
}
