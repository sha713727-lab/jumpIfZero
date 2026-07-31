"use client";

import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { adminIcons } from "@/components/admin/AdminIcons";
import { useModalFocus } from "@/lib/useModalFocus";

type ConfirmDeleteModalProps = {
  readonly open: boolean;
  readonly title: string;
  readonly lede: string;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
};

export function ConfirmDeleteModal({
  open,
  title,
  lede,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const CloseIcon = adminIcons.close;

  useModalFocus({
    open,
    containerRef,
    initialFocusRef: closeRef,
    onClose,
  });

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(13,18,11,0.72)] p-0 sm:items-center sm:p-6"
    >
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
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-black/8 bg-cream p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id={titleId}
              className="text-[1.15rem] font-extrabold tracking-[-0.02em] text-[#0d120b]"
            >
              {title}
            </h2>
            <p className="mt-2 text-[0.9rem] font-medium text-black/50">{lede}</p>
          </div>
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
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-black/12 bg-white px-4 py-2.5 text-[0.88rem] font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-[#0d120b] px-4 py-2.5 text-[0.88rem] font-bold text-cream"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
