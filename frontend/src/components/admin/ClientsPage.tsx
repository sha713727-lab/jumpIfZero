"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminIcons } from "@/components/admin/AdminIcons";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { useAdmin } from "@/components/admin/AdminProvider";
import { archiveAdminClientAction } from "@/lib/submitAdminClients";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

export function ClientsPage() {
  const { state, setClients, setProjects, setInvoices, setMessages, setFiles } =
    useAdmin();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();
  const TrashIcon = adminIcons.trash;

  const deleteTarget = state.clients.find((item) => item.id === deleteId);

  const confirmDelete = () => {
    if (!deleteTarget || deletePending) {
      return;
    }
    const clientId = deleteTarget.id;
    const version = deleteTarget.version;
    startDeleteTransition(async () => {
      setDeleteError(null);
      const result = await archiveAdminClientAction({
        clientId,
        version,
      });
      if (!result.ok) {
        setDeleteError(
          result.reason === "conflict"
            ? "Client was updated elsewhere. Refresh and try again."
            : result.reason === "unauthorized"
              ? "You are not allowed to delete this client."
              : "Could not delete client. Try again.",
        );
        return;
      }
      setClients(state.clients.filter((item) => item.id !== clientId));
      setProjects(state.projects.filter((item) => item.clientId !== clientId));
      setInvoices(state.invoices.filter((item) => item.clientId !== clientId));
      setMessages(state.messages.filter((item) => item.clientId !== clientId));
      setFiles(state.files.filter((item) => item.clientId !== clientId));
      setDeleteOpen(false);
      setDeleteId(null);
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Clients"
        lede="Client accounts and delivery workspaces."
      />

      <div className={cardClass}>
        <ul className="divide-y divide-black/8">
          {state.clients.map((client) => {
            const projectCount = state.projects.filter(
              (project) => project.clientId === client.id,
            ).length;

            return (
              <li key={client.id}>
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3 transition-colors hover:opacity-80"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-logo-gradient text-[0.78rem] font-extrabold text-[#0d120b]">
                      {client.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[0.95rem] font-bold text-[#0d120b]">
                        {client.name}
                      </p>
                      <p className="truncate text-[0.82rem] font-medium text-black/45">
                        {client.company} · {client.email}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-[0.82rem] font-medium text-black/40">
                      {projectCount} projects
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                        client.status === "active"
                          ? "bg-[rgba(92,104,73,0.16)] text-brand"
                          : "bg-black/8 text-black/45"
                      }`}
                    >
                      {client.status === "active" ? "Active" : "Paused"}
                    </span>
                    <button
                      type="button"
                      aria-label={`Delete ${client.name}`}
                      onClick={() => {
                        setDeleteId(client.id);
                        setDeleteError(null);
                        setDeleteOpen(true);
                      }}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete client"
        lede={
          deleteError ??
          `Remove "${deleteTarget?.name ?? "this client"}" and related projects, invoices, messages, files, and login?`
        }
        onClose={() => {
          if (deletePending) {
            return;
          }
          setDeleteOpen(false);
          setDeleteId(null);
          setDeleteError(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
