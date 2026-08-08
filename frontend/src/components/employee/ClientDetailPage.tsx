"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import { useEmployee } from "@/components/employee/EmployeeProvider";
import { projectStatusLabel } from "@/constants/admin";

const cardClass =
  "rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6";

export function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { state } = useEmployee();

  const clientId = typeof params.id === "string" ? params.id : "";
  const client = state.clients.find((item) => item.id === clientId);

  useEffect(() => {
    if (!client) {
      router.replace("/employee/clients");
    }
  }, [client, router]);

  if (!client) {
    return null;
  }

  const projects = state.projects.filter((item) => item.clientId === clientId);
  const messages = state.messages
    .filter((item) => item.clientId === clientId)
    .slice(-5);
  const files = state.files.filter((item) => item.clientId === clientId);

  return (
    <div className="space-y-6">
      <EmployeePageHeader title={client.company} lede={client.name} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cardClass}>
          <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            Contact
          </h2>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="text-[0.84rem] font-medium text-black/45">Email</dt>
              <dd className="text-[0.88rem] font-semibold text-[#0d120b]">
                {client.email}
              </dd>
            </div>
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
          </dl>
        </section>

        <section className={cardClass}>
          <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            Projects
          </h2>
          <ul className="mt-4 divide-y divide-black/8">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/employee/projects/${project.id}`}
                  className="flex flex-col gap-1 py-3 transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-[0.9rem] font-semibold text-[#0d120b]">
                    {project.title}
                  </span>
                  <span className="text-[0.82rem] font-medium text-black/45">
                    {projectStatusLabel[project.status]} · {project.updatedAt}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${cardClass} lg:col-span-2`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
              Recent messages
            </h2>
            <Link
              href="/employee/messages"
              className="text-[0.84rem] font-bold text-brand hover:text-[#2f3a28]"
            >
              Open thread
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-black/8">
            {messages.map((message) => (
              <li key={message.id} className="py-3">
                <p className="text-[0.82rem] font-bold text-black/45">
                  {message.from === "client"
                    ? client.name
                    : message.from === "employee"
                      ? "You"
                      : "Admin"}{" "}
                  · {message.at}
                </p>
                <p className="mt-1 text-[0.9rem] font-medium text-[#0d120b]">
                  {message.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${cardClass} lg:col-span-2`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
              Files
            </h2>
            <Link
              href="/employee/files"
              className="text-[0.84rem] font-bold text-brand hover:text-[#2f3a28]"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-black/8">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[0.9rem] font-semibold text-[#0d120b]">
                    {file.name}
                  </p>
                  <p className="text-[0.82rem] font-medium text-black/45">
                    {file.kind} · {file.updatedAt}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
