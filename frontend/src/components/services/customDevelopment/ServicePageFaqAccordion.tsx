"use client";

import { useState } from "react";

export function ServicePageFaqAccordion({
  heading,
  items,
}: {
  readonly heading: string;
  readonly items: readonly {
    readonly id: string;
    readonly question: string;
    readonly answer: string;
  }[];
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Frequently asked questions"
      data-header-tone="light"
      data-header-bg="#f7f5f0"
      className="bg-cream px-5 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto w-full max-w-[1360px]">
        <h2 className="text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase">
          {heading}
        </h2>
        <ul className="mt-10 divide-y divide-black/10 border-y border-black/10">
          {items.map((item) => {
            const open = openId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span className="text-[1.02rem] leading-[1.35] font-extrabold tracking-[-0.01em] text-black">
                    {item.question}
                  </span>
                  <span aria-hidden="true" className="text-brand shrink-0">
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open ? (
                  <p className="pb-5 max-w-3xl text-[0.95rem] leading-[1.6] font-medium text-black/60">
                    {item.answer}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
