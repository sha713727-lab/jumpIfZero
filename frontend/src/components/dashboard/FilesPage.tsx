"use client";

import { useState } from "react";
import { demoFiles } from "@/constants/dashboard";

export function FilesPage() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          Files
        </h1>
        <p className="mt-2 text-[0.95rem] font-medium text-black/50">
          Deliverables and shared assets for your engagements.
        </p>
      </div>

      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-brand/25 bg-[rgba(116,129,95,0.1)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
        >
          {notice}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]">
        <ul className="divide-y divide-black/8">
          {demoFiles.map((file) => (
            <li
              key={file.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:px-6"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[rgba(116,129,95,0.14)] px-2 py-0.5 text-[0.68rem] font-extrabold tracking-[0.1em] text-brand uppercase">
                    {file.type}
                  </span>
                  <p className="truncate text-[0.95rem] font-bold text-[#0d120b]">
                    {file.name}
                  </p>
                </div>
                <p className="mt-1 text-[0.8rem] font-medium text-black/40">
                  {file.project} · {file.size} · {file.uploaded}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setNotice(`Download started for ${file.name} (demo).`)
                }
                className="shrink-0 rounded-xl bg-logo-gradient px-4 py-2 text-[0.8rem] font-extrabold text-[#0d120b] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
