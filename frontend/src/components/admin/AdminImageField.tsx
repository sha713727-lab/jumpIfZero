"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { adminIcons } from "@/components/admin/AdminIcons";
import { adminLabelClass } from "@/components/admin/AdminFormModal";

type AdminImageFieldProps = {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
};

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("invalid"));
      return;
    }

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

export function AdminImageField({
  label,
  value,
  onChange,
}: AdminImageFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;
  const PlusIcon = adminIcons.plus;

  const pick = () => {
    inputRef.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readImageFile(file);
      onChange(dataUrl);
    } catch {
      return;
    }
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
        onChange={(event) => {
          const file = event.target.files?.[0];
          void onFile(file);
          event.target.value = "";
        }}
      />
      {value ? (
        <div className="space-y-3">
          <div className="relative h-40 w-full overflow-hidden rounded-xl border border-black/10 bg-white">
            <Image
              src={value}
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
              onClick={pick}
              className="inline-flex items-center gap-2 rounded-xl border border-black/12 bg-white px-3.5 py-2 text-[0.84rem] font-semibold"
            >
              <EditIcon className="size-4" />
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-2 rounded-xl border border-black/12 bg-white px-3.5 py-2 text-[0.84rem] font-semibold text-[#0d120b]"
            >
              <TrashIcon className="size-4" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-black/20 bg-[rgba(116,129,95,0.08)] px-4 py-8 text-[0.9rem] font-semibold text-[#0d120b] transition-colors hover:bg-[rgba(116,129,95,0.14)]"
        >
          <PlusIcon className="size-4" />
          Upload image
        </button>
      )}
    </div>
  );
}
