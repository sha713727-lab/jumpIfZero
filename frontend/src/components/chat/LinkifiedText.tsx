"use client";

import type { ReactNode } from "react";

const URL_PATTERN =
  /\b((?:https?:\/\/|www\.)[^\s<>"'`]+[^\s<>"'`.,;:!?)\]])/gi;

function normalizeHref(raw: string): string {
  return raw.startsWith("http://") || raw.startsWith("https://")
    ? raw
    : `https://${raw}`;
}

export function LinkifiedText({
  text,
  className,
}: {
  readonly text: string;
  readonly className?: string;
}) {
  if (text.length === 0) {
    return null;
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  const pattern = new RegExp(URL_PATTERN.source, URL_PATTERN.flags);
  let match = pattern.exec(text);

  while (match !== null) {
    const start = match.index;
    const value = match[1] ?? match[0];
    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }
    nodes.push(
      <a
        key={`${start}-${value}`}
        href={normalizeHref(value)}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 break-all"
      >
        {value}
      </a>,
    );
    lastIndex = start + value.length;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <span className={className}>{nodes}</span>;
}
