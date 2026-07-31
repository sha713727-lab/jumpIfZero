"use client";

import Image from "next/image";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminDemo } from "@/components/admin/AdminDemoProvider";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

export function FilesPage() {
  const { state } = useAdminDemo();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Files"
        lede="Shared deliverables across all clients."
      />

      <div className={cardClass}>
        <ul className="divide-y divide-black/8">
          {state.files.map((file) => {
            const client = state.clients.find((c) => c.id === file.clientId);

            return (
              <li key={file.id}>
                <Link
                  href={`/admin/clients/${file.clientId}/files`}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {file.url ? (
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-black/8">
                        <Image
                          src={file.url}
                          alt={file.name}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-[0.92rem] font-semibold text-[#0d120b]">
                        {file.name}
                      </p>
                      {client ? (
                        <p className="text-[0.82rem] font-medium text-black/45">
                          {client.company}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-black/8 px-2.5 py-1 text-[0.72rem] font-bold text-black/50">
                      {file.kind}
                    </span>
                    <span className="text-[0.8rem] font-medium text-black/35">
                      {file.updatedAt}
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
