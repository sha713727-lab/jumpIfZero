"use client";

import Link from "next/link";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { adminIcons } from "@/components/admin/AdminIcons";
import { adminTodayLabel, useAdmin } from "@/components/admin/AdminProvider";
import {
  adminOverviewCopy,
  projectStatusLabel,
  projectStatuses,
} from "@/constants/admin";

const cardClass =
  "rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

const mixColors = ["#5c6849", "#2f3a28", "#f9a137", "#e8891a"] as const;

export function OverviewPage() {
  const { identity, state } = useAdmin();
  const firstName = identity.name.trim().split(/\s+/)[0] ?? identity.name;

  const activeServices = state.services.filter((item) => item.active).length;
  const openCallbacks = state.callbacks.filter((item) => item.status === "new").length;
  const activeFaqs = state.faqs.filter((item) => item.active).length;

  const metrics = [
    {
      id: "services",
      label: "Active services",
      value: activeServices,
      detail: `${state.services.length} total in catalog`,
      Icon: adminIcons.services,
      tone: "bg-[rgba(92, 104, 73,0.16)] text-brand",
    },
    {
      id: "clients",
      label: "Clients",
      value: state.clients.length,
      detail: `${state.clients.filter((c) => c.status === "active").length} active accounts`,
      Icon: adminIcons.clients,
      tone: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
    },
    {
      id: "projects",
      label: "Projects",
      value: state.projects.length,
      detail: `${state.projects.filter((p) => p.status === "in_progress").length} in progress`,
      Icon: adminIcons.projects,
      tone: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
    },
    {
      id: "callbacks",
      label: "Open callbacks",
      value: openCallbacks,
      detail: `${state.callbacks.length} total requests`,
      Icon: adminIcons.callbacks,
      tone: "bg-[rgba(92, 104, 73,0.16)] text-brand",
    },
    {
      id: "faqs",
      label: "Active FAQs",
      value: activeFaqs,
      detail: `${state.faqs.length} published entries`,
      Icon: adminIcons.faqs,
      tone: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
    },
  ] as const;

  const recentProjects = [...state.projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  const statusPoints = projectStatuses.map((status) => ({
    label: projectStatusLabel[status].split(" ")[0] ?? status,
    value: state.projects.filter((project) => project.status === status).length,
  }));

  const chartMax = Math.max(8, ...statusPoints.map((point) => point.value));

  const catalogCounts = [
    { label: "Services", value: state.services.filter((s) => s.active).length },
    { label: "Portfolio", value: state.portfolio.filter((p) => p.active).length },
    { label: "Blog", value: state.blog.filter((b) => b.active).length },
    { label: "FAQs", value: activeFaqs },
  ];

  const mixTotal = catalogCounts.reduce((sum, item) => sum + item.value, 0);
  const mixSlices = catalogCounts.map((item, index) => ({
    label: item.label,
    value: item.value,
    percent: mixTotal === 0 ? 0 : Math.round((item.value / mixTotal) * 100),
    color: mixColors[index % mixColors.length] ?? "#5c6849",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.7rem,3vw,2.2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          {adminOverviewCopy.welcome}, {firstName}.
        </h1>
        <p className="mt-2 max-w-2xl text-[0.95rem] font-medium text-black/50">
          {adminOverviewCopy.lede}
        </p>
        <p className="mt-1 text-[0.82rem] font-medium text-black/35">
          {adminTodayLabel()}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.Icon;
          return (
            <article key={metric.id} className={`${cardClass} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-[0.68rem] font-extrabold tracking-[0.16em] text-black/45 uppercase">
                  {metric.label}
                </p>
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-xl ${metric.tone}`}
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
        })}
      </div>

      <section className={`${cardClass} p-5 md:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            {adminOverviewCopy.recentTitle}
          </h2>
          <Link
            href={adminOverviewCopy.recentHref}
            className="text-[0.84rem] font-bold text-brand transition-colors hover:text-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {adminOverviewCopy.recentLink}
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-black/8">
          {recentProjects.map((project) => {
            const client = state.clients.find((c) => c.id === project.clientId);
            return (
              <li key={project.id}>
                <Link
                  href={`/admin/clients/${project.clientId}/projects`}
                  className="flex flex-col gap-1 py-3.5 transition-colors hover:bg-[#f3f5ef]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-[0.92rem] font-semibold text-[#0d120b]">
                    {project.title}
                  </span>
                  <span className="text-[0.8rem] font-medium text-black/40">
                    {client?.company ?? "Client"} · {project.updatedAt}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${cardClass} p-5 md:p-6`}>
          <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            {adminOverviewCopy.coverageTitle}
          </h2>
          <p className="mt-1 text-[0.84rem] font-medium text-black/45">
            {adminOverviewCopy.coverageLede}
          </p>
          <div className="mt-4">
            <AreaChart points={statusPoints} max={chartMax} />
          </div>
        </section>

        <section className={`${cardClass} p-5 md:p-6`}>
          <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            {adminOverviewCopy.mixTitle}
          </h2>
          <p className="mt-1 text-[0.84rem] font-medium text-black/45">
            {adminOverviewCopy.mixLede}
          </p>
          <div className="mt-5">
            <DonutChart slices={mixSlices} total={mixTotal} />
          </div>
        </section>
      </div>

      <section className={`${cardClass} p-5 md:p-6`}>
        <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
          {adminOverviewCopy.statusTitle}
        </h2>
        <p className="mt-1 text-[0.84rem] font-medium text-black/45">
          {adminOverviewCopy.statusLede}
        </p>
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-black/8 bg-[#f3f5ef] px-4 py-3">
          <span className="text-[0.72rem] font-extrabold tracking-[0.16em] text-black/40 uppercase">
            {adminOverviewCopy.statusLabel}
          </span>
          <span className="inline-flex items-center gap-2 text-[0.88rem] font-bold text-brand">
            <span className="size-2 rounded-full bg-brand" />
            {adminOverviewCopy.statusValue}
          </span>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${cardClass} p-5 md:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
              Services
            </h2>
            <Link
              href="/admin/services"
              className="text-[0.84rem] font-bold text-brand hover:text-[#2f3a28]"
            >
              View all
            </Link>
          </div>
          <p className="mt-1 text-[0.82rem] font-medium text-black/40">
            {adminOverviewCopy.servicesLive}
          </p>
          <ul className="mt-4 divide-y divide-black/8">
            {state.services.slice(0, 5).map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="text-[0.9rem] font-semibold text-[#0d120b]">
                  {service.title}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                    service.active
                      ? "bg-[rgba(92, 104, 73,0.16)] text-brand"
                      : "bg-black/8 text-black/45"
                  }`}
                >
                  {service.active ? "Active" : "Inactive"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${cardClass} p-5 md:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
              FAQs
            </h2>
            <Link
              href="/admin/faqs"
              className="text-[0.84rem] font-bold text-brand hover:text-[#2f3a28]"
            >
              View all
            </Link>
          </div>
          <p className="mt-1 text-[0.82rem] font-medium text-black/40">
            {adminOverviewCopy.faqsLive}
          </p>
          <ul className="mt-4 divide-y divide-black/8">
            {state.faqs.slice(0, 5).map((faq) => (
              <li key={faq.id} className="py-3">
                <p className="text-[0.9rem] font-semibold text-[#0d120b]">
                  {faq.question}
                </p>
                <p className="mt-1 line-clamp-1 text-[0.82rem] font-medium text-black/45">
                  {faq.answer}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
