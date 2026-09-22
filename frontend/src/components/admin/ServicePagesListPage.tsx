"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cardClass } from "@/components/admin/servicePages/types";
import type { AdminServicePageListItem } from "@/lib/data/adminServicePages";
import { listAdminServicePagesAction } from "@/lib/submitAdminServicePage";

export function ServicePagesListPage() {
  const [items, setItems] = useState<readonly AdminServicePageListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await listAdminServicePagesAction();
      if (!result.ok || !("items" in result)) {
        setError("Could not load service pages.");
        return;
      }
      setItems(result.items);
    });
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Service pages"
        lede="Edit pillar landing pages, SEO, and nested section content."
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      {pending && items.length === 0 && !error ? (
        <p className="text-sm text-black/50">Loading…</p>
      ) : null}

      {!pending && items.length === 0 && !error ? (
        <div
          className={`${cardClass} px-5 py-10 text-center text-[0.95rem] font-medium text-black/45`}
        >
          No service pages yet.
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/service-pages/${item.slug}`}
              className={`${cardClass} block p-5 transition-colors hover:border-brand/30 hover:bg-[#f7f8f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
                    {item.title}
                  </h2>
                  <p className="mt-1 truncate text-[0.84rem] font-medium text-black/45">
                    /services/{item.slug}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                      item.active
                        ? "bg-[rgba(92,104,73,0.16)] text-brand"
                        : "bg-black/8 text-black/45"
                    }`}
                  >
                    {item.active ? "Published" : "Draft"}
                  </span>
                  {item.parentId ? (
                    <span className="rounded-full bg-black/8 px-2.5 py-1 text-[0.72rem] font-bold text-black/45">
                      Child
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-4 text-[0.82rem] font-medium text-black/40">
                Nav: {item.navLabel || "—"}
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
