import { dashboardIcons } from "@/components/dashboard/DashboardIcons";
import type { CustomerMetric } from "@/lib/data/customerPortalTypes";

type Metric = CustomerMetric;

const toneClass: Record<Metric["tone"], string> = {
  brand: "bg-[rgba(92, 104, 73,0.16)] text-brand",
  secondary: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  dark: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
};

const iconById: Record<
  Metric["id"],
  (typeof dashboardIcons)[keyof typeof dashboardIcons]
> = {
  projects: dashboardIcons.projects,
  invoices: dashboardIcons.invoices,
  messages: dashboardIcons.messages,
  files: dashboardIcons.files,
  milestones: dashboardIcons.overview,
};

export function MetricCard({ metric }: { readonly metric: Metric }) {
  const Icon = iconById[metric.id];

  return (
    <article className="rounded-2xl border border-black/8 bg-white p-4 shadow-[0_8px_24px_rgba(47,58,40,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.68rem] font-extrabold tracking-[0.16em] text-black/45 uppercase">
          {metric.label}
        </p>
        <span
          className={`inline-flex size-9 items-center justify-center rounded-xl ${toneClass[metric.tone]}`}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-[2rem] leading-none font-extrabold tracking-[-0.04em] text-[#0d120b]">
        {metric.value}
      </p>
      <p className="mt-2 text-[0.82rem] font-medium text-black/45">
        {metric.detail}
      </p>
    </article>
  );
}
