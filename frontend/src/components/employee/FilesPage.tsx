"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import { useEmployee } from "@/components/employee/EmployeeProvider";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { employeeIcons } from "@/components/employee/EmployeeIcons";
import { employeeEmptyCopy } from "@/constants/employee";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  archiveDeliveryFileAction,
  uploadDeliveryFileAction,
} from "@/lib/submitEmployeeDelivery";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

export function FilesPage() {
  const { state, setFiles } = useEmployee();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadClientId, setUploadClientId] = useState(
    state.clients[0]?.id ?? "",
  );
  const [pending, startTransition] = useTransition();

  const TrashIcon = employeeIcons.trash;

  const onUpload = () => {
    if (!uploadClientId) {
      return;
    }

    fileInputRef.current?.click();
  };

  const onFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !uploadClientId) {
      return;
    }

    const formData = new FormData();
    formData.set("clientId", uploadClientId);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadDeliveryFileAction(formData);
      if (result.ok && "data" in result) {
        setFiles([...state.files, result.data]);
      }
      event.target.value = "";
    });
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    startTransition(async () => {
      const result = await archiveDeliveryFileAction({ id: deleteId });
      if (result.ok) {
        setFiles(state.files.filter((item) => item.id !== deleteId));
        setDeleteOpen(false);
        setDeleteId(null);
      }
    });
  };

  const deleteTarget = state.files.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        title="Files"
        lede="Shared deliverables across your assigned clients."
        actionLabel="Upload file"
        onAction={onUpload}
      />

      {state.clients.length > 1 ? (
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="employee-file-client"
            className="text-[0.84rem] font-semibold text-[#0d120b]"
          >
            Upload for
          </label>
          <select
            id="employee-file-client"
            value={uploadClientId}
            onChange={(event) => setUploadClientId(event.target.value)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[0.84rem] font-semibold"
          >
            {state.clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        aria-label="Upload file"
        disabled={pending}
        onChange={onFileSelect}
      />

      <div className={cardClass} aria-busy={pending}>
        {state.files.length === 0 ? (
          <EmptyState message={employeeEmptyCopy.files} />
        ) : (
          <ul className="divide-y divide-black/8">
            {state.files.map((file) => {
              const client = state.clients.find((c) => c.id === file.clientId);

              return (
                <li
                  key={file.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[0.92rem] font-semibold text-[#0d120b]">
                      {file.name}
                    </p>
                    <p className="text-[0.82rem] font-medium text-black/45">
                      {client?.company} · {file.kind} · {file.updatedAt}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={`/api/files/${file.id}/download`}
                      className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-brand"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() => {
                        setDeleteId(file.id);
                        setDeleteOpen(true);
                      }}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete file"
        lede={`Remove "${deleteTarget?.name ?? "this file"}" from the client workspace?`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
