"use client";

import Image from "next/image";
import { useId, useRef, useState, useTransition } from "react";
import { adminIcons } from "@/components/admin/AdminIcons";
import { adminLabelClass } from "@/components/admin/AdminFormModal";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import { CMS_MEDIA_MAX_BYTES } from "@/lib/cmsMediaLimits";
import { uploadCmsMediaAction } from "@/lib/submitCmsMedia";

type AdminImageFieldProps = {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
};

export function AdminImageField({
  label,
  value,
  onChange,
}: AdminImageFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;
  const PlusIcon = adminIcons.plus;
  const previewSrc = cmsMediaSrc(value);

  const pick = () => {
    inputRef.current?.click();
  };

  const onFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > CMS_MEDIA_MAX_BYTES) {
      setError("Image must be 50 MB or smaller.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadCmsMediaAction(formData);

      if (!result.ok) {
        setError(
          result.reason === "validation"
            ? "Image must be a JPEG, PNG, or WebP under 50 MB."
            : "Could not upload image.",
        );
        return;
      }

      onChange(result.imagePath);
    });
  };

  return (
    <div>
      <label htmlFor={inputId} className={adminLabelClass}>
        {label}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={pending}
        onChange={(event) => {
          const file = event.target.files?.[0];
          onFile(file);
          event.target.value = "";
        }}
      />
      {error ? (
        <p className="mb-3 text-[0.84rem] font-semibold text-red-700">{error}</p>
      ) : null}
      {previewSrc ? (
        <div className="space-y-3">
          <div className="relative h-40 w-full overflow-hidden rounded-xl border border-black/10 bg-white">
            <Image
              src={previewSrc}
              alt="Selected image preview"
              fill
              unoptimized
              className="object-cover"
              sizes="400px"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={pick}
              className="inline-flex items-center gap-2 rounded-xl border border-black/12 bg-white px-3.5 py-2 text-[0.84rem] font-semibold disabled:opacity-40"
            >
              <EditIcon className="size-4" />
              Replace
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => onChange("")}
              className="inline-flex items-center gap-2 rounded-xl border border-black/12 bg-white px-3.5 py-2 text-[0.84rem] font-semibold text-[#0d120b] disabled:opacity-40"
            >
              <TrashIcon className="size-4" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={pick}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-black/20 bg-[rgba(92, 104, 73,0.08)] px-4 py-8 text-[0.9rem] font-semibold text-[#0d120b] transition-colors hover:bg-[rgba(92, 104, 73,0.14)] disabled:opacity-40"
        >
          <PlusIcon className="size-4" />
          {pending ? "Uploading…" : "Upload image"}
        </button>
      )}
    </div>
  );
}
