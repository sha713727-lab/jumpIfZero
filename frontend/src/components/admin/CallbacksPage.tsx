"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { useAdmin } from "@/components/admin/AdminProvider";
import { adminIcons } from "@/components/admin/AdminIcons";
import type { AdminCallback } from "@/lib/data/admin";
import {
  deleteAdminCallbackAction,
  resolveAdminCallbackAction,
} from "@/lib/submitAdminCallbacks";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

function ViewCallbackModal({
  open,
  callback,
  pending,
  onClose,
  onResolve,
  onDelete,
}: {
  readonly open: boolean;
  readonly callback: AdminCallback | null;
  readonly pending: boolean;
  readonly onClose: () => void;
  readonly onResolve: () => void;
  readonly onDelete: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const CloseIcon = adminIcons.close;
  const TrashIcon = adminIcons.trash;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open || !callback || typeof document === "undefined") {
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
              {callback.name}
            </h2>
            <p className="mt-1 text-[0.84rem] font-medium text-black/45">
              {callback.email} · {callback.phone}
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
          {callback.note}
        </p>
        <p className="mt-4 text-[0.8rem] font-medium text-black/40">
          Received {callback.updatedAt}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-xl border border-black/12 bg-white px-4 py-2.5 text-[0.88rem] font-semibold text-[#0d120b] disabled:opacity-40"
          >
            <TrashIcon className="size-4" />
            Delete
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="rounded-xl border border-black/12 bg-white px-4 py-2.5 text-[0.88rem] font-semibold disabled:opacity-40"
          >
            Close
          </button>
          {callback.status === "new" ? (
            <button
              type="button"
              disabled={pending}
              onClick={onResolve}
              className="rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream disabled:opacity-40"
            >
              Mark resolved
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function CallbacksPage() {
  const { state, setCallbacks } = useAdmin();
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const TrashIcon = adminIcons.trash;

  const selected = state.callbacks.find((item) => item.id === viewId) ?? null;
  const deleteTarget =
    state.callbacks.find((item) => item.id === deleteId) ?? null;

  const resolve = () => {
    if (!viewId || !selected || pending) {
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await resolveAdminCallbackAction({
        id: selected.id,
        version: selected.version,
      });
      if (!result.ok || !("callback" in result)) {
        setError("Could not mark callback as resolved.");
        return;
      }
      setCallbacks(
        state.callbacks.map((item) =>
          item.id === result.callback.id ? result.callback : item,
        ),
      );
    });
  };

  const confirmDelete = () => {
    if (!deleteId || !deleteTarget || pending) {
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await deleteAdminCallbackAction({
        id: deleteTarget.id,
        version: deleteTarget.version,
      });
      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "This callback was updated elsewhere. Refresh and try again."
            : "Could not delete callback. Try again.",
        );
        return;
      }
      setCallbacks(state.callbacks.filter((item) => item.id !== deleteId));
      if (viewId === deleteId) {
        setViewId(null);
      }
      setDeleteId(null);
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Callbacks"
        lede="Phone callback requests from the public site."
      />

      {error ? (
        <p className="rounded-xl border border-[#e8891a]/30 bg-[rgba(249,161,55,0.12)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]">
          {error}
        </p>
      ) : null}

      <div className={cardClass}>
        <ul className="divide-y divide-black/8">
          {state.callbacks.map((item) => (
            <li key={item.id}>
              <div className="flex items-stretch gap-1 px-2 py-1 sm:px-3">
                <button
                  type="button"
                  onClick={() => setViewId(item.id)}
                  className="flex min-w-0 flex-1 flex-col gap-1 px-3 py-3 text-left transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[0.92rem] font-semibold text-[#0d120b]">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-[0.82rem] font-medium text-black/45">
                      {item.phone} · {item.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                        item.status === "new"
                          ? "bg-[rgba(249,161,55,0.18)] text-[#e8891a]"
                          : "bg-[rgba(92,104,73,0.16)] text-brand"
                      }`}
                    >
                      {item.status === "new" ? "New" : "Resolved"}
                    </span>
                    <span className="text-[0.8rem] font-medium text-black/35">
                      {item.updatedAt}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  aria-label={`Delete callback from ${item.name}`}
                  disabled={pending}
                  onClick={() => {
                    setError(null);
                    setDeleteId(item.id);
                  }}
                  className="my-2 inline-flex size-9 shrink-0 items-center justify-center self-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ViewCallbackModal
        open={Boolean(viewId)}
        callback={selected}
        pending={pending}
        onClose={() => {
          if (!pending) {
            setViewId(null);
          }
        }}
        onResolve={resolve}
        onDelete={() => {
          if (selected) {
            setError(null);
            setDeleteId(selected.id);
          }
        }}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteId)}
        title="Delete callback"
        lede={`Remove callback from "${deleteTarget?.name ?? "this contact"}"?`}
        onClose={() => {
          if (!pending) {
            setDeleteId(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
