"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cardClass } from "@/components/admin/servicePages/types";
import type { AdminServicePageListItem } from "@/lib/data/adminServicePages";
import { listAdminServicePagesAction } from "@/lib/submitAdminServicePage";

function publicPath(
  item: AdminServicePageListItem,
  parentById: ReadonlyMap<string, AdminServicePageListItem>,
): string {
  if (item.parentId === null) {
    return `/services/${item.slug}`;
  }
  const parent = parentById.get(item.parentId);
  if (parent === undefined) {
    return `/services/${item.slug}`;
  }
  return `/services/${parent.slug}/${item.slug}`;
}

export function ServicePagesListPage() {
  const [items, setItems] = useState<readonly AdminServicePageListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await listAdminServicePagesAction();
      if (!result.ok || !("items" in result)) {
        setError("Could not load services.");
        return;
      }
      setItems(result.items);
    });
  }, []);

  const { pillars, childrenByParent, parentById } = useMemo(() => {
    const byId = new Map(items.map((item) => [item.id, item] as const));
    const pillarsList = items
      .filter((item) => item.parentId === null)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    const grouped = new Map<string, AdminServicePageListItem[]>();
    for (const item of items) {
      if (item.parentId === null) {
        continue;
      }
      const existing = grouped.get(item.parentId);
      if (existing === undefined) {
        grouped.set(item.parentId, [item]);
      } else {
        existing.push(item);
      }
    }
    for (const children of grouped.values()) {
      children.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
      );
    }
    return {
      pillars: pillarsList,
      childrenByParent: grouped,
      parentById: byId,
    };
  }, [items]);

  const orphanChildren = useMemo(
    () =>
      items.filter(
        (item) =>
          item.parentId !== null && !parentById.has(item.parentId),
      ),
    [items, parentById],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        lede="Public service pillars and nested pages used on the site."
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
          No services yet.
        </div>
      ) : null}

      {pillars.length > 0 ? (
        <div className="space-y-4">
          {pillars.map((pillar) => {
            const children = childrenByParent.get(pillar.id) ?? [];
            return (
              <section key={pillar.id} className={cardClass}>
                <Link
                  href={`/admin/services/${pillar.slug}`}
                  className="flex items-start justify-between gap-3 border-b border-black/8 px-5 py-4 transition-colors hover:bg-[#f7f8f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  <div className="min-w-0">
                    <h2 className="truncate text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
                      {pillar.title}
                    </h2>
                    <p className="mt-1 truncate text-[0.84rem] font-medium text-black/45">
                      {publicPath(pillar, parentById)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                      pillar.active
                        ? "bg-[rgba(92,104,73,0.16)] text-brand"
                        : "bg-black/8 text-black/45"
                    }`}
                  >
                    {pillar.active ? "Published" : "Draft"}
                  </span>
                </Link>
                {children.length > 0 ? (
                  <ul className="divide-y divide-black/8">
                    {children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/admin/services/${child.slug}`}
                          className="flex items-start justify-between gap-3 px-5 py-3.5 pl-8 transition-colors hover:bg-[#f7f8f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[0.92rem] font-semibold text-[#0d120b]">
                              {child.title}
                            </p>
                            <p className="mt-0.5 truncate text-[0.78rem] font-medium text-black/40">
                              {publicPath(child, parentById)}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                              child.active
                                ? "bg-[rgba(92,104,73,0.16)] text-brand"
                                : "bg-black/8 text-black/45"
                            }`}
                          >
                            {child.active ? "Published" : "Draft"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : null}

      {orphanChildren.length > 0 ? (
        <section className={cardClass}>
          <div className="border-b border-black/8 px-5 py-3">
            <h2 className="text-[0.95rem] font-extrabold text-[#0d120b]">
              Other pages
            </h2>
          </div>
          <ul className="divide-y divide-black/8">
            {orphanChildren.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/services/${item.slug}`}
                  className="flex items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[#f7f8f4]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[0.92rem] font-semibold text-[#0d120b]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 truncate text-[0.78rem] font-medium text-black/40">
                      {publicPath(item, parentById)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                      item.active
                        ? "bg-[rgba(92,104,73,0.16)] text-brand"
                        : "bg-black/8 text-black/45"
                    }`}
                  >
                    {item.active ? "Published" : "Draft"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
