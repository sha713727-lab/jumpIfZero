import Link from "next/link";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { demoCustomer } from "@/lib/data/customer";
import {
  engagementMix,
  overviewCopy,
  overviewMetrics,
  progressSeries,
  recentActivity,
} from "@/lib/data/dashboard";
import { EmptyState } from "@/components/ui/EmptyState";

export function OverviewPage() {
  const mixTotal = engagementMix.reduce((sum, item) => sum + item.value, 0);
  const activity: readonly (typeof recentActivity)[number][] = recentActivity;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.7rem,3vw,2.2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          {overviewCopy.welcome}, {demoCustomer.name.split(" ")[0]}.
        </h1>
        <p className="mt-2 max-w-2xl text-[0.95rem] font-medium text-black/50">
          {overviewCopy.lede}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {overviewMetrics.map((metric) => (
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

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6">
          <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            {overviewCopy.coverageTitle}
          </h2>
          <p className="mt-1 text-[0.84rem] font-medium text-black/45">
            {overviewCopy.coverageLede}
          </p>
          <div className="mt-4">
            <AreaChart points={progressSeries} />
          </div>
        </section>

        <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6">
          <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            {overviewCopy.mixTitle}
          </h2>
          <p className="mt-1 text-[0.84rem] font-medium text-black/45">
            {overviewCopy.mixLede}
          </p>
          <div className="mt-5">
            <DonutChart slices={engagementMix} total={mixTotal} />
          </div>
        </section>
      </div>
    </div>
  );
}
