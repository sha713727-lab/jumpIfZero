"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminTodayLabel, useAdminDemo } from "@/components/admin/AdminDemoProvider";
import { adminIcons } from "@/components/admin/AdminIcons";
import type { AdminContactMessage } from "@/constants/adminDemo";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef } from "react";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

function ViewContactModal({
  open,
  message,
  onClose,
  onMarkRead,
}: {
  readonly open: boolean;
  readonly message: AdminContactMessage | null;
  readonly onClose: () => void;
  readonly onMarkRead: () => void;
}) {
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

  if (!open || !message || typeof document === "undefined") {
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
          <div>
            <h2
              id={titleId}
              className="text-[1.15rem] font-extrabold tracking-[-0.02em] text-[#0d120b]"
            >
              {message.subject}
            </h2>
            <p className="mt-1 text-[0.84rem] font-medium text-black/45">
              {message.name} · {message.email}
            </p>
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
        <p className="mt-5 text-[0.95rem] font-medium leading-relaxed text-[#0d120b]">
          {message.body}
        </p>
        <p className="mt-4 text-[0.8rem] font-medium text-black/40">
          Received {message.updatedAt}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-black/12 bg-white px-4 py-2.5 text-[0.88rem] font-semibold"
          >
            Close
          </button>
          {message.status === "new" ? (
            <button
              type="button"
              onClick={onMarkRead}
              className="rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream"
            >
              Mark as read
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ContactPage() {
  const { state, setContactMessages } = useAdminDemo();
  const [viewId, setViewId] = useState<string | null>(null);

  const selected = state.contactMessages.find((item) => item.id === viewId) ?? null;

  const markRead = () => {
    if (!viewId) {
      return;
    }
    setContactMessages(
      state.contactMessages.map((item) =>
        item.id === viewId
          ? { ...item, status: "read" as const, updatedAt: adminTodayLabel() }
          : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contact"
        lede="Messages submitted through the public contact form."
      />

      <div className={cardClass}>
        <ul className="divide-y divide-black/8">
          {state.contactMessages.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setViewId(item.id)}
                className="flex w-full flex-col gap-1 px-5 py-4 text-left transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[0.92rem] font-semibold text-[#0d120b]">
                    {item.subject}
                  </p>
                  <p className="mt-0.5 text-[0.82rem] font-medium text-black/45">
                    {item.name} · {item.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                      item.status === "new"
                        ? "bg-[rgba(249,161,55,0.18)] text-[#e8891a]"
                        : "bg-black/8 text-black/45"
                    }`}
                  >
                    {item.status === "new" ? "New" : "Read"}
                  </span>
                  <span className="text-[0.8rem] font-medium text-black/35">
                    {item.updatedAt}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ViewContactModal
        open={Boolean(viewId)}
        message={selected}
        onClose={() => setViewId(null)}
        onMarkRead={markRead}
      />
    </div>
  );
}
