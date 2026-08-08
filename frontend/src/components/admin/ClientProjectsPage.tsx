"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import {
  adminEmptyCopy,
  projectStatusLabel,
  projectStatuses,
  type ProjectStatus,
} from "@/constants/admin";
import { EmptyState } from "@/components/ui/EmptyState";
import { createProjectAction } from "@/lib/submitOps";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

const statusPillClass: Record<ProjectStatus, string> = {
  requested: "bg-black/8 text-black/50",
  approved: "bg-[rgba(92,104,73,0.12)] text-brand",
  in_progress: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  completed: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
};

type ProjectForm = {
  title: string;
  serviceId: string;
  status: ProjectStatus;
};

const emptyForm: ProjectForm = {
  title: "",
  serviceId: "",
  status: "requested",
};

export function ClientProjectsPage() {
  const params = useParams();
  const { state, setProjects, updateProjectStatus } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [pending, startTransition] = useTransition();

  const clientId = typeof params.id === "string" ? params.id : "";
  const projects = state.projects.filter((item) => item.clientId === clientId);

  const save = () => {
    const title = form.title.trim();
    if (!title || !clientId || !form.serviceId) {
      return;
    }

    startTransition(async () => {
      const result = await createProjectAction({
        clientId,
        serviceId: form.serviceId,
        title,
      });
      if (!result.ok || !("data" in result)) {
        return;
      }
      setProjects([...state.projects, result.data]);
      setModalOpen(false);
      setForm(emptyForm);
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Projects"
        lede="Delivery work scoped for this client."
        actionLabel="Add project"
        onAction={() => setModalOpen(true)}
      />

      <div className={cardClass}>
        {projects.length === 0 ? (
          <EmptyState message={adminEmptyCopy.clientProjects} />
        ) : (
          <ul className="divide-y divide-black/8">
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[0.92rem] font-semibold text-[#0d120b]">
                    {project.title}
                  </p>
                  <p className="mt-0.5 text-[0.82rem] font-medium text-black/45">
                    {project.service} · Updated {project.updatedAt}
                  </p>
                </div>
                <select
                  value={project.status}
                  aria-label={`Status for ${project.title}`}
                  onChange={(event) =>
                    updateProjectStatus(
                      project.id,
                      event.target.value as ProjectStatus,
                    )
                  }
                  className="rounded-xl border border-black/10 bg-[#f3f5ef] px-3 py-2 text-[0.84rem] font-semibold"
                >
                  {projectStatuses.map((status) => (
                    <option key={status} value={status}>
                      {projectStatusLabel[status]}
                    </option>
                  ))}
                </select>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${statusPillClass[project.status]}`}
                >
                  {projectStatusLabel[project.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdminFormModal
        open={modalOpen}
        title="Add project"
        onClose={() => {
          if (!pending) {
            setModalOpen(false);
          }
        }}
        onSubmit={save}
        submitLabel="Create project"
      >
        <div>
          <label className="block">
            <span className={adminLabelClass}>Title</span>
            <input
            className={adminFieldClass}
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Service</span>
            <select
            className={adminFieldClass}
            value={form.serviceId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                serviceId: event.target.value,
              }))
            }
          >
            <option value="">Select service</option>
            {state.services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Status</span>
            <select
            className={adminFieldClass}
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as ProjectStatus,
              }))
            }
          >
            {projectStatuses.map((status) => (
              <option key={status} value={status}>
                {projectStatusLabel[status]}
              </option>
            ))}
          </select>
          </label>
        </div>
      </AdminFormModal>
    </div>
  );
}
