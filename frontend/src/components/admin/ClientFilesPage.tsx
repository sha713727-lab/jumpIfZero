"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminTodayLabel, useAdminDemo } from "@/components/admin/AdminDemoProvider";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import { adminEmptyCopy } from "@/constants/admin";
import type { AdminFile } from "@/lib/data/admin";
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

export function ClientFilesPage() {
  const params = useParams();
  const { state, setFiles } = useAdminDemo();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const TrashIcon = adminIcons.trash;

  const clientId = typeof params.id === "string" ? params.id : "";
  const files = state.files.filter((item) => item.clientId === clientId);

  const onUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
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
      clientId,
      name: file.name,
      kind: fileKind(file),
      url,
      updatedAt: adminTodayLabel(),
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

  const deleteTarget = files.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Files"
        lede="Shared deliverables for this client."
        actionLabel="Upload file"
        onAction={onUpload}
      />

      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        aria-label="Upload file"
        onChange={(event) => {
          void onFileSelect(event);
        }}
      />

      <div className={cardClass}>
        {files.length === 0 ? (
          <EmptyState message={adminEmptyCopy.clientFiles} />
        ) : (
          <ul className="divide-y divide-black/8">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {file.url ? (
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-black/8">
                      <Image
                        src={file.url}
                        alt={file.name}
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
                      {file.kind} · {file.updatedAt}
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
            ))}
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
