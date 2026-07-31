"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { adminIcons } from "@/components/admin/AdminIcons";

type AdminFormModalProps = {
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly submitLabel?: string;
  readonly children: ReactNode;
};

export function AdminFormModal({
  open,
  title,
  onClose,
  onSubmit,
  submitLabel = "Save",
  children,
}: AdminFormModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const CloseIcon = adminIcons.close;

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(13,18,11,0.72)] p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-black/8 bg-cream p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className="text-[1.15rem] font-extrabold tracking-[-0.02em] text-[#0d120b]"
          >
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-black/10 bg-white"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {children}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-black/12 bg-white px-4 py-2.5 text-[0.88rem] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export const adminFieldClass =
  "w-full rounded-xl border-0 bg-[rgba(116,129,95,0.12)] px-4 py-3 text-[0.95rem] font-medium text-black outline-none transition-[box-shadow,background-color] duration-200 placeholder:text-black/35 hover:bg-[rgba(116,129,95,0.16)] focus-visible:bg-[rgba(116,129,95,0.16)] focus-visible:shadow-[0_0_0_2px_#f7f5f0,0_0_0_4px_#f9a137]";

export const adminLabelClass =
  "mb-2 block text-[0.88rem] font-semibold text-[#0d120b]";
