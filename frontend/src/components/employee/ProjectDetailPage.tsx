"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import { useEmployeeDemo } from "@/components/employee/EmployeeDemoProvider";
import { adminFieldClass } from "@/components/admin/AdminFormModal";
import { projectStatusLabel, type ProjectStatus } from "@/constants/admin";

const cardClass =
  "rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6";

const statusPillClass: Record<ProjectStatus, string> = {
  requested: "bg-black/8 text-black/50",
  approved: "bg-[rgba(116,129,95,0.12)] text-brand",
  in_progress: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  completed: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
};

export function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { state, updateProjectNotes } = useEmployeeDemo();

  const projectId = typeof params.id === "string" ? params.id : "";
  const project = state.projects.find((item) => item.id === projectId);
  const client = project
    ? state.clients.find((item) => item.id === project.clientId)
    : undefined;

  const [notesByProject, setNotesByProject] = useState<Record<string, string>>(
    {},
  );

  const notes = project
    ? (notesByProject[project.id] ?? project.notes)
    : "";

  const setNotes = (value: string) => {
    if (!project) {
      return;
    }

    setNotesByProject((current) => ({ ...current, [project.id]: value }));
  };

  useEffect(() => {
    if (!project) {
      router.replace("/employee/projects");
    }
  }, [project, router]);

  if (!project) {
    return null;
  }

  const onSaveNotes = () => {
    updateProjectNotes(project.id, notes.trim());
  };

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        title={project.title}
        lede={`${project.service} · Updated ${project.updatedAt}`}
      />

      <section className={cardClass}>
        <dl className="space-y-3">
          <div className="flex flex-wrap justify-between gap-4">
            <dt className="text-[0.84rem] font-medium text-black/45">Status</dt>
            <dd>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${statusPillClass[project.status]}`}
              >
                {projectStatusLabel[project.status]}
              </span>
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <dt className="text-[0.84rem] font-medium text-black/45">Client</dt>
            <dd>
              <Link
                href={`/employee/clients/${project.clientId}`}
                className="text-[0.88rem] font-semibold text-brand transition-colors hover:text-[#2f3a28]"
              >
                {client?.company}
              </Link>
            </dd>
          </div>
        </dl>
      </section>

      <section className={cardClass}>
        <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
          Notes
        </h2>
        <textarea
          rows={6}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className={`${adminFieldClass} mt-4 resize-y`}
        />
        <button
          type="button"
          onClick={onSaveNotes}
          className="mt-4 rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream transition-colors hover:bg-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Save notes
        </button>
      </section>
    </div>
  );
}
