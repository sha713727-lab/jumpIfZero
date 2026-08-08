"use client";

import Link from "next/link";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { overviewCopy } from "@/lib/data/dashboard";
import {
  buildCustomerMetrics,
  buildRecentActivity,
} from "@/lib/data/customerPortalView";
import { EmptyState } from "@/components/ui/EmptyState";

export function OverviewPage() {
  const { state } = useDashboard();
  const metrics = buildCustomerMetrics(state);
  const activity = buildRecentActivity(state);
  const firstName = state.user.name.trim().split(/\s+/)[0] ?? state.user.name;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.7rem,3vw,2.2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          {overviewCopy.welcome}, {firstName}.
        </h1>
        <p className="mt-2 max-w-2xl text-[0.95rem] font-medium text-black/50">
          {overviewCopy.lede}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            {overviewCopy.recentTitle}
          </h2>
          <Link
            href={overviewCopy.recentHref}
            className="text-[0.84rem] font-bold text-brand transition-colors hover:text-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {overviewCopy.recentLink}
          </Link>
        </div>
        {activity.length === 0 ? (
          <EmptyState message={overviewCopy.emptyActivity} />
        ) : (
          <ul className="mt-4 divide-y divide-black/8">
            {activity.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex flex-col gap-1 py-3.5 transition-colors hover:bg-[#f3f5ef]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-[0.92rem] font-semibold text-[#0d120b]">
                    {item.title}
                  </span>
                  <span className="text-[0.8rem] font-medium text-black/40">
                    {item.meta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
