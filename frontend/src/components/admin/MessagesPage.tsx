"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminDemo } from "@/components/admin/AdminDemoProvider";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

export function MessagesPage() {
  const { state } = useAdminDemo();

  const threads = state.clients
    .map((client) => {
      const messages = state.messages.filter((m) => m.clientId === client.id);
      const latest = messages[messages.length - 1];
      const unread = messages.filter(
        (m) => !m.read && m.from === "client",
      ).length;

      return { client, latest, unread };
    })
    .filter((thread) => thread.latest);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Messages"
        lede="Client conversations across all accounts."
      />

      <div className={cardClass}>
        <ul className="divide-y divide-black/8">
          {threads.map(({ client, latest, unread }) => (
            <li key={client.id}>
              <Link
                href={`/admin/clients/${client.id}/messages`}
                className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[0.92rem] font-semibold text-[#0d120b]">
                    {client.company}
                  </p>
                  <p className="line-clamp-1 text-[0.82rem] font-medium text-black/45">
                    {latest?.body}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 ? (
                    <span className="rounded-full bg-logo-gradient px-2.5 py-1 text-[0.72rem] font-bold text-[#0d120b]">
                      {unread} unread
                    </span>
                  ) : null}
                  <span className="text-[0.8rem] font-medium text-black/35">
                    {latest?.at}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
