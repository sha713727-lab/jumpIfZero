"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type MagneticLinkProps = {
  readonly href: string;
  readonly className?: string;
  readonly children: ReactNode;
};

export function MagneticLink({ href, className, children }: MagneticLinkProps) {
  const classes = className
    ? `transition-colors duration-300 ${className}`
    : "transition-colors duration-300";

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
