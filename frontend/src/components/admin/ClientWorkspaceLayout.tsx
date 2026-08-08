"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";

const tabs = [
  { label: "Overview", segment: "" },
  { label: "Projects", segment: "projects" },
  { label: "Messages", segment: "messages" },
  { label: "Files", segment: "files" },
  { label: "Invoices", segment: "invoices" },
  { label: "Team", segment: "team" },
] as const;

export function ClientWorkspaceLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useAdmin();

  const clientId = typeof params.id === "string" ? params.id : "";
  const client = state.clients.find((item) => item.id === clientId);

  useEffect(() => {
    if (clientId && !client) {
      router.replace("/admin/clients");
    }
  }, [clientId, client, router]);

  if (!client) {
    return null;
  }

  const basePath = `/admin/clients/${clientId}`;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/clients"
          className="text-[0.82rem] font-bold text-brand hover:text-[#2f3a28]"
        >
          ← All clients
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-logo-gradient text-[0.82rem] font-extrabold text-[#0d120b]">
            {client.initials}
          </span>
          <div>
            <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
              {client.company}
            </h1>
            <p className="text-[0.88rem] font-medium text-black/45">
              {client.name} · {client.email}
            </p>
          </div>
          <span
            className={`ml-auto rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
              client.status === "active"
                ? "bg-[rgba(92,104,73,0.16)] text-brand"
                : "bg-black/8 text-black/45"
            }`}
          >
            {client.status === "active" ? "Active" : "Paused"}
          </span>
        </div>
      </div>

      <nav
        aria-label="Client workspace"
        className="flex flex-wrap gap-2 border-b border-black/8 pb-1"
      >
        {tabs.map((tab) => {
          const href = tab.segment ? `${basePath}/${tab.segment}` : basePath;
          const active =
            tab.segment === ""
              ? pathname === basePath
              : pathname.startsWith(`${basePath}/${tab.segment}`);

          return (
            <Link
              key={tab.label}
              href={href}
              className={`rounded-t-xl px-4 py-2.5 text-[0.88rem] font-semibold transition-colors ${
                active
                  ? "border border-b-0 border-black/8 bg-white text-brand"
                  : "text-black/50 hover:text-[#0d120b]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
