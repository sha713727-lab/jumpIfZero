"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import { projectStatusLabel, type ProjectStatus } from "@/constants/admin";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

const statusPillClass: Record<ProjectStatus, string> = {
  requested: "bg-black/8 text-black/50",
  approved: "bg-[rgba(92,104,73,0.12)] text-brand",
  in_progress: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  completed: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
};

export function ProjectsPage() {
  const { state } = useAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Projects"
        lede="All delivery work across client accounts."
      />

      <div className={cardClass}>
        <ul className="divide-y divide-black/8">
          {state.projects.map((project) => {
            const client = state.clients.find((c) => c.id === project.clientId);

            return (
              <li key={project.id}>
                <Link
                  href={`/admin/clients/${project.clientId}/projects`}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[0.92rem] font-semibold text-[#0d120b]">
                      {project.title}
                    </p>
                    <p className="text-[0.82rem] font-medium text-black/45">
                      {client?.company ?? "Client"} · {project.service}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${statusPillClass[project.status]}`}
                    >
                      {projectStatusLabel[project.status]}
                    </span>
                    <span className="text-[0.8rem] font-medium text-black/35">
                      {project.updatedAt}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
