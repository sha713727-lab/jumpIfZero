"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdminDemo } from "@/components/admin/AdminDemoProvider";
import { adminEmptyCopy, projectStatusLabel } from "@/constants/admin";
import { EmptyState } from "@/components/ui/EmptyState";

const cardClass =
  "rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6";

export function ClientOverviewPage() {
  const params = useParams();
  const { state } = useAdminDemo();

  const clientId = typeof params.id === "string" ? params.id : "";
  const client = state.clients.find((item) => item.id === clientId);

  if (!client) {
    return null;
  }

  const projects = state.projects.filter((item) => item.clientId === clientId);
  const assigned = state.employees.filter((employee) =>
    client.assignedEmployeeIds.includes(employee.id),
  );

  const statusCounts = {
    in_progress: projects.filter((p) => p.status === "in_progress").length,
    requested: projects.filter((p) => p.status === "requested").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={cardClass}>
        <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
          Account summary
        </h2>
        <dl className="mt-4 space-y-3">
          <div className="flex justify-between gap-4">
            <dt className="text-[0.84rem] font-medium text-black/45">Phone</dt>
            <dd className="text-[0.88rem] font-semibold text-[#0d120b]">
              {client.phone}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[0.84rem] font-medium text-black/45">
              Member since
            </dt>
            <dd className="text-[0.88rem] font-semibold text-[#0d120b]">
              {client.memberSince}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[0.84rem] font-medium text-black/45">
              Total projects
            </dt>
            <dd className="text-[0.88rem] font-semibold text-[#0d120b]">
              {projects.length}
            </dd>
          </div>
        </dl>
      </section>

      <section className={cardClass}>
        <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
          Project counts
        </h2>
        <ul className="mt-4 space-y-2">
          <li className="flex justify-between text-[0.88rem]">
            <span className="font-medium text-black/45">In progress</span>
            <span className="font-bold text-[#0d120b]">
              {statusCounts.in_progress}
            </span>
          </li>
          <li className="flex justify-between text-[0.88rem]">
            <span className="font-medium text-black/45">Requested</span>
            <span className="font-bold text-[#0d120b]">
              {statusCounts.requested}
            </span>
          </li>
          <li className="flex justify-between text-[0.88rem]">
            <span className="font-medium text-black/45">Completed</span>
            <span className="font-bold text-[#0d120b]">
              {statusCounts.completed}
            </span>
          </li>
        </ul>
      </section>

      <section className={`${cardClass} lg:col-span-2`}>
        <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
          Assigned employees
        </h2>
        {assigned.length === 0 ? (
          <EmptyState message={adminEmptyCopy.clientEmployeesAssigned} />
        ) : (
          <ul className="mt-4 divide-y divide-black/8">
            {assigned.map((employee) => (
              <li
                key={employee.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-[0.9rem] font-semibold text-[#0d120b]">
                    {employee.name}
                  </p>
                  <p className="text-[0.82rem] font-medium text-black/45">
                    {employee.role} · {employee.department}
                  </p>
                </div>
                <span className="text-[0.82rem] font-medium text-black/40">
                  {employee.email}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${cardClass} lg:col-span-2`}>
        <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
          Recent projects
        </h2>
        {projects.length === 0 ? (
          <EmptyState message={adminEmptyCopy.clientRecentProjects} />
        ) : (
          <>
            <ul className="mt-4 divide-y divide-black/8">
              {projects.slice(0, 5).map((project) => (
                <li
                  key={project.id}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-[0.9rem] font-semibold text-[#0d120b]">
                    {project.title}
                  </span>
                  <span className="text-[0.82rem] font-medium text-black/45">
                    {projectStatusLabel[project.status]} · {project.updatedAt}
                  </span>
                </li>
              ))}
            </ul>
            {projects.length > 5 ? (
              <Link
                href={`/admin/clients/${clientId}/projects`}
                className="mt-4 inline-flex text-[0.84rem] font-bold text-brand"
              >
                {adminEmptyCopy.viewAllProjects}
              </Link>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
