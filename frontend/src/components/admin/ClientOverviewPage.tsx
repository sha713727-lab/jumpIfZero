"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { useAdmin } from "@/components/admin/AdminProvider";
import { adminEmptyCopy, projectStatusLabel } from "@/constants/admin";
import { EmptyState } from "@/components/ui/EmptyState";
import { updateAdminClientContactAction } from "@/lib/submitAdminClients";

const cardClass =
  "rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6";

type ContactForm = {
  name: string;
  email: string;
  company: string;
  phone: string;
  location: string;
  plan: string;
  clientContactTitle: string;
  status: "active" | "paused";
  memberSince: string;
};

export function ClientOverviewPage() {
  const params = useParams();
  const { state, setClients } = useAdmin();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ContactForm | null>(null);

  const clientId = typeof params.id === "string" ? params.id : "";
  const client = state.clients.find((item) => item.id === clientId);

  useEffect(() => {
    if (!client) {
      setForm(null);
      return;
    }
    setForm({
      name: client.name,
      email: client.email,
      company: client.company,
      phone: client.phone,
      location: client.location,
      plan: client.plan,
      clientContactTitle: client.clientContactTitle,
      status: client.status,
      memberSince: client.memberSince,
    });
    setError(null);
    setSaved(false);
  }, [client]);

  if (!client || form === null) {
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

  const setField = <K extends keyof ContactForm>(
    key: K,
    value: ContactForm[K],
  ) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setSaved(false);
    setError(null);
  };

  const save = () => {
    startTransition(async () => {
      const result = await updateAdminClientContactAction({
        clientId: client.id,
        clientVersion: client.version,
        userId: client.userId,
        name: form.name,
        email: form.email,
        company: form.company,
        phone: form.phone,
        location: form.location,
        plan: form.plan,
        clientContactTitle: form.clientContactTitle,
        statusCode: form.status,
        memberSince: form.memberSince,
      });
      if (!result.ok || !("data" in result)) {
        setError(
          result.ok
            ? "Could not save. Try again."
            : result.reason === "conflict"
              ? "This account was updated elsewhere. Refresh and try again."
              : result.reason === "validation"
                ? "Check the fields and try again."
                : "Could not save. Try again.",
        );
        return;
      }
      setClients(
        state.clients.map((item) =>
          item.id === client.id ? result.data : item,
        ),
      );
      setSaved(true);
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={`${cardClass} space-y-4 lg:col-span-2`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
              Contact information
            </h2>
            <p className="mt-1 text-[0.84rem] font-medium text-black/45">
              Updates appear on the client portal profile, shell, and invoices.
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={adminLabelClass}>Contact name</span>
            <input
              className={adminFieldClass}
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Email</span>
            <input
              type="email"
              className={adminFieldClass}
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Company</span>
            <input
              className={adminFieldClass}
              value={form.company}
              onChange={(event) => setField("company", event.target.value)}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Phone</span>
            <input
              className={adminFieldClass}
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Location</span>
            <input
              className={adminFieldClass}
              value={form.location}
              onChange={(event) => setField("location", event.target.value)}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Contact title</span>
            <input
              className={adminFieldClass}
              value={form.clientContactTitle}
              onChange={(event) =>
                setField("clientContactTitle", event.target.value)
              }
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Plan</span>
            <input
              className={adminFieldClass}
              value={form.plan}
              onChange={(event) => setField("plan", event.target.value)}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Member since</span>
            <input
              type="date"
              className={adminFieldClass}
              value={form.memberSince}
              onChange={(event) => setField("memberSince", event.target.value)}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Status</span>
            <select
              className={adminFieldClass}
              value={form.status}
              onChange={(event) =>
                setField("status", event.target.value as "active" | "paused")
              }
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </label>
        </div>

        {error ? (
          <p className="text-[0.88rem] font-semibold text-[#a33]" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="text-[0.88rem] font-semibold text-brand">
            Contact information saved.
          </p>
        ) : null}
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

      <section className={cardClass}>
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
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-[0.9rem] font-semibold text-[#0d120b]">
                    {employee.name}
                  </p>
                  <p className="text-[0.8rem] font-medium text-black/45">
                    {employee.email}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${cardClass} lg:col-span-2`}>
        <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
          Projects
        </h2>
        {projects.length === 0 ? (
          <EmptyState message={adminEmptyCopy.clientProjects} />
        ) : (
          <ul className="mt-4 divide-y divide-black/8">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/admin/clients/${clientId}/projects`}
                  className="flex flex-col gap-1 py-3 transition-colors hover:text-brand sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-[0.9rem] font-semibold text-[#0d120b]">
                    {project.title}
                  </span>
                  <span className="text-[0.8rem] font-medium text-black/45">
                    {projectStatusLabel[project.status]} · {project.updatedAt}
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
