"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import { adminEmptyCopy } from "@/constants/admin";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  archiveFileAction,
  uploadFileAction,
} from "@/lib/submitOps";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

const FILE_KIND_PROFESSIONAL = "professional";

function fileCategoryLabel(kind: string): string {
  const normalized = kind.trim().toLowerCase();
  if (
    normalized.length === 0 ||
    normalized === FILE_KIND_PROFESSIONAL ||
    normalized.includes("/")
  ) {
    return "Professional";
  }
  return kind;
}

export function ClientFilesPage() {
  const params = useParams();
  const { state, setFiles } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const TrashIcon = adminIcons.trash;

  const clientId = typeof params.id === "string" ? params.id : "";
  const files = state.files.filter((item) => item.clientId === clientId);

  const onUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.set("clientId", clientId);
    formData.set("kind", FILE_KIND_PROFESSIONAL);
    formData.set("file", file);

    startTransition(async () => {
      setError(null);
      const result = await uploadFileAction(formData);
      event.target.value = "";

      if (!result.ok || !("data" in result)) {
        setError(
          result.ok
            ? "Upload failed."
            : result.reason === "validation"
              ? "Choose a JPEG, PNG, WebP, or PDF file."
              : "Could not upload file.",
        );
        return;
      }

      setFiles([...state.files, result.data]);
    });
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await archiveFileAction({ id: deleteId });
      if (!result.ok) {
        setError("Could not delete file.");
        return;
      }
      setFiles(state.files.filter((item) => item.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    });
  };

  const deleteTarget = files.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Files"
        lede="Professional deliverables for this client."
        actionLabel="Add file"
        onAction={onUpload}
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only"
        aria-label="Upload file"
        disabled={pending}
        onChange={onFileSelect}
      />

      <div className={cardClass} aria-busy={pending}>
        {files.length === 0 ? (
          <EmptyState message={adminEmptyCopy.clientFiles} />
        ) : (
          <ul className="divide-y divide-black/8">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-[0.92rem] font-semibold text-[#0d120b]">
                    {file.name}
                  </p>
                  <p className="text-[0.82rem] font-medium text-black/45">
                    {file.updatedAt}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[rgba(92,104,73,0.14)] px-2.5 py-1 text-[0.72rem] font-bold text-brand">
                    {fileCategoryLabel(file.kind)}
                  </span>
                  <a
                    href={`/api/files/${file.id}/download`}
                    className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-brand"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    aria-label="Delete"
                    disabled={pending}
                    onClick={() => {
                      setDeleteId(file.id);
                      setDeleteOpen(true);
                    }}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
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
