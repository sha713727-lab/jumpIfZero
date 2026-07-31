"use client";

import Link from "next/link";
import { employeeIcons } from "@/components/employee/EmployeeIcons";
import {
  employeeTodayLabel,
  useEmployeeDemo,
} from "@/components/employee/EmployeeDemoProvider";
import { employeeOverviewCopy } from "@/constants/employee";
import { projectStatusLabel } from "@/constants/admin";
import { leadStatusLabel, saleStatusLabel } from "@/constants/sales";

const cardClass =
  "rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

function DeliveryOverview() {
  const { state } = useEmployeeDemo();
  const firstName = state.employee.name.split(" ")[0];

  const unreadCount = state.messages.filter(
    (message) => message.from === "client" && !message.read,
  ).length;

  const metrics = [
    {
      id: "clients",
      label: "Assigned clients",
      value: state.clients.length,
      detail: "Accounts you support",
      Icon: employeeIcons.clients,
      tone: "bg-[rgba(116,129,95,0.16)] text-brand",
    },
    {
      id: "projects",
      label: "Projects",
      value: state.projects.length,
      detail: `${state.projects.filter((p) => p.status === "in_progress").length} in progress`,
      Icon: employeeIcons.projects,
      tone: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
    },
    {
      id: "messages",
      label: "Unread messages",
      value: unreadCount,
      detail: "From client threads",
      Icon: employeeIcons.messages,
      tone: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
    },
    {
      id: "files",
      label: "Files",
      value: state.files.length,
      detail: "Shared deliverables",
      Icon: employeeIcons.files,
      tone: "bg-[rgba(116,129,95,0.16)] text-brand",
    },
  ] as const;

  const recentProjects = [...state.projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  const unreadMessages = state.messages
    .filter((message) => message.from === "client" && !message.read)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.7rem,3vw,2.2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          {employeeOverviewCopy.welcome}, {firstName}.
        </h1>
        <p className="mt-2 max-w-2xl text-[0.95rem] font-medium text-black/50">
          {employeeOverviewCopy.deliveryLede}
        </p>
        <p className="mt-1 text-[0.82rem] font-medium text-black/35">
          {employeeTodayLabel()}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            Recent projects
          </h2>
          <Link
            href="/employee/projects"
            className="text-[0.84rem] font-bold text-brand transition-colors hover:text-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            View all
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-black/8">
          {recentProjects.map((project) => {
            const client = state.clients.find((c) => c.id === project.clientId);
            return (
              <li key={project.id}>
                <Link
                  href={`/employee/projects/${project.id}`}
                  className="flex flex-col gap-1 py-3.5 transition-colors hover:bg-[#f3f5ef]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-[0.92rem] font-semibold text-[#0d120b]">
                    {project.title}
                  </span>
                  <span className="text-[0.8rem] font-medium text-black/40">
                    {client?.company} · {projectStatusLabel[project.status]} ·{" "}
                    {project.updatedAt}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {unreadMessages.length > 0 ? (
        <section className={`${cardClass} p-5 md:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
              Unread messages
            </h2>
            <Link
              href="/employee/messages"
              className="text-[0.84rem] font-bold text-brand transition-colors hover:text-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              Open messages
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-black/8">
            {unreadMessages.map((message) => {
              const client = state.clients.find((c) => c.id === message.clientId);
              return (
                <li key={message.id}>
                  <Link
                    href="/employee/messages"
                    className="flex flex-col gap-1 py-3.5 transition-colors hover:bg-[#f3f5ef]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-[0.92rem] font-semibold text-[#0d120b]">
                      {client?.company}
                    </span>
                    <span className="line-clamp-1 text-[0.82rem] font-medium text-black/45">
                      {message.body}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function SalesOverview() {
  const { state } = useEmployeeDemo();
  const firstName = state.employee.name.split(" ")[0];
  const selfId = state.employee.id;

  const openLeads = state.leads.filter(
    (lead) => lead.status !== "converted" && lead.status !== "closed",
  );

  const unreadSalesMessages = state.salesMessages.filter(
    (message) => message.toRepId === selfId && !message.read,
  );

  const metrics = [
    {
      id: "sales",
      label: "Sales",
      value: state.sales.length,
      detail: "Records you own",
      Icon: employeeIcons.sales,
      tone: "bg-[rgba(116,129,95,0.16)] text-brand",
    },
    {
      id: "leads",
      label: "Open leads",
      value: openLeads.length,
      detail: "Not converted or closed",
      Icon: employeeIcons.leads,
      tone: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
    },
    {
      id: "followUps",
      label: "Follow-ups",
      value: state.leadFollowUps.length,
      detail: "Logged on your leads",
      Icon: employeeIcons.messages,
      tone: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
    },
    {
      id: "messages",
      label: "Unread messages",
      value: unreadSalesMessages.length,
      detail: "From sales team chat",
      Icon: employeeIcons.messages,
      tone: "bg-[rgba(116,129,95,0.16)] text-brand",
    },
  ] as const;

  const recentSales = [...state.sales]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  const recentOpenLeads = [...openLeads]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.7rem,3vw,2.2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          {employeeOverviewCopy.welcome}, {firstName}.
        </h1>
        <p className="mt-2 max-w-2xl text-[0.95rem] font-medium text-black/50">
          {employeeOverviewCopy.salesLede}
        </p>
        <p className="mt-1 text-[0.82rem] font-medium text-black/35">
          {employeeTodayLabel()}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            Recent sales
          </h2>
          <Link
            href="/employee/sales"
            className="text-[0.84rem] font-bold text-brand transition-colors hover:text-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            View all
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-black/8">
          {recentSales.map((sale) => (
            <li key={sale.id}>
              <Link
                href={`/employee/sales/${sale.id}`}
                className="flex flex-col gap-1 py-3.5 transition-colors hover:bg-[#f3f5ef]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-[0.92rem] font-semibold text-[#0d120b]">
                  {sale.legalName}
                </span>
                <span className="text-[0.8rem] font-medium text-black/40">
                  {sale.usDot ? `DOT ${sale.usDot}` : sale.truckType} ·{" "}
                  {saleStatusLabel[sale.status]} · {sale.updatedAt}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${cardClass} p-5 md:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            Open leads
          </h2>
          <Link
            href="/employee/leads"
            className="text-[0.84rem] font-bold text-brand transition-colors hover:text-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            View all
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-black/8">
          {recentOpenLeads.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/employee/leads/${lead.id}`}
                className="flex flex-col gap-1 py-3.5 transition-colors hover:bg-[#f3f5ef]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-[0.92rem] font-semibold text-[#0d120b]">
                  {lead.company}
                </span>
                <span className="text-[0.8rem] font-medium text-black/40">
                  {lead.contactName} · {leadStatusLabel[lead.status]} ·{" "}
                  {lead.updatedAt}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function OverviewPage() {
  const { state } = useEmployeeDemo();

  if (state.employee.kind === "sales") {
    return <SalesOverview />;
  }

  return <DeliveryOverview />;
}
