"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import {
  employeeTodayLabel,
  useEmployeeDemo,
} from "@/components/employee/EmployeeDemoProvider";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { employeeIcons } from "@/components/employee/EmployeeIcons";
import type { AdminFile } from "@/lib/data/admin";
import { employeeEmptyCopy } from "@/constants/employee";
import { EmptyState } from "@/components/ui/EmptyState";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

function fileKind(file: File): string {
  if (file.type.startsWith("image/")) {
    return "Image";
  }

  const extension = file.name.split(".").pop();
  return extension ? extension.toUpperCase() : "File";
}

function readImageDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("invalid"));
    };
    reader.onerror = () => reject(new Error("invalid"));
    reader.readAsDataURL(file);
  });
}

export function FilesPage() {
  const { state, setFiles } = useEmployeeDemo();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadClientId, setUploadClientId] = useState(
    state.clients[0]?.id ?? "",
  );

  const TrashIcon = employeeIcons.trash;

  const onUpload = () => {
    if (!uploadClientId) {
      return;
    }

    fileInputRef.current?.click();
  };

  const onFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !uploadClientId) {
      return;
    }

    let url: string | null = null;

    if (file.type.startsWith("image/")) {
      try {
        url = await readImageDataUrl(file);
      } catch {
        url = null;
      }
    }

    const payload: AdminFile = {
      id: crypto.randomUUID(),
      clientId: uploadClientId,
      name: file.name,
      kind: fileKind(file),
      url,
      updatedAt: employeeTodayLabel(),
    };

    setFiles([...state.files, payload]);
    event.target.value = "";
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    setFiles(state.files.filter((item) => item.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
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
        onChange={(event) => {
          void onFileSelect(event);
        }}
      />

      <div className={cardClass}>
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
                  <div className="flex min-w-0 items-center gap-3">
                    {file.url ? (
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-black/8">
                        <Image
                          src={file.url}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-[0.92rem] font-semibold text-[#0d120b]">
                        {file.name}
                      </p>
                      <p className="text-[0.82rem] font-medium text-black/45">
                        {client?.company} · {file.kind} · {file.updatedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => {
                      setDeleteId(file.id);
                      setDeleteOpen(true);
                    }}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white"
                  >
                    <TrashIcon className="size-4" />
                  </button>
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
