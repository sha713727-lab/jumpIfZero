"use client";

import { useId, useRef, useState } from "react";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { uploadFileAction } from "@/lib/submitCustomerPortal";
import { dashboardEmptyCopy } from "@/lib/data/dashboard";
import { EmptyState } from "@/components/ui/EmptyState";

export function FilesPage() {
  const formId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { state, setFiles } = useDashboard();
  const files = state.files;
  const [notice, setNotice] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const download = (id: string) => {
    const anchor = document.createElement("a");
    anchor.href = `/api/files/${id}/download`;
    anchor.rel = "noopener";
    anchor.click();
  };

  const onUpload = async () => {
    const input = inputRef.current;
    if (!input || !input.files || input.files.length === 0 || uploading) {
      return;
    }

    const formData = new FormData();
    formData.set("file", input.files[0]!);
    setUploading(true);
    setNotice(null);

    const result = await uploadFileAction(formData);
    setUploading(false);
    input.value = "";

    if (!result.ok) {
      setNotice("Upload failed. Check the file and try again.");
      return;
    }

    setFiles([result.data, ...files]);
    setNotice(`${result.data.name} uploaded.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
            Files
          </h1>
          <p className="mt-2 text-[0.95rem] font-medium text-black/50">
            Deliverables and shared assets for your engagements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            id={`${formId}-file`}
            type="file"
            className="sr-only"
            onChange={() => {
              void onUpload();
            }}
          />
          <label
            htmlFor={`${formId}-file`}
            className={`inline-flex cursor-pointer rounded-xl bg-logo-gradient px-4 py-2 text-[0.8rem] font-extrabold text-[#0d120b] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${uploading ? "pointer-events-none opacity-70" : ""}`}
          >
            {uploading ? "Uploading…" : "Upload file"}
          </label>
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-brand/25 bg-[rgba(92, 104, 73,0.1)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
        >
          {notice}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]">
        {files.length === 0 ? (
          <EmptyState message={dashboardEmptyCopy.files} />
        ) : (
          <ul className="divide-y divide-black/8">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:px-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[rgba(92, 104, 73,0.14)] px-2 py-0.5 text-[0.68rem] font-extrabold tracking-[0.1em] text-brand uppercase">
                      {file.type}
                    </span>
                    <p className="truncate text-[0.95rem] font-bold text-[#0d120b]">
                      {file.name}
                    </p>
                  </div>
                  <p className="mt-1 text-[0.8rem] font-medium text-black/40">
                    {file.size} · {file.uploaded}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => download(file.id)}
                  className="shrink-0 rounded-xl bg-logo-gradient px-4 py-2 text-[0.8rem] font-extrabold text-[#0d120b] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
