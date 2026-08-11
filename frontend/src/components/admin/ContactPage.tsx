"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { useAdmin } from "@/components/admin/AdminProvider";
import { adminIcons } from "@/components/admin/AdminIcons";
import type { AdminContactMessage } from "@/lib/data/admin";
import {
  deleteAdminContactMessageAction,
  markAdminContactMessageReadAction,
} from "@/lib/submitAdminContact";
import {
  getAdminSiteContactAction,
  updateAdminSiteContactAction,
} from "@/lib/submitAdminSiteContact";
import type { SiteContactPublic } from "@jumpifzero/contracts/content";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type SiteContactForm = {
  email: string;
  phone: string;
  phoneHref: string;
  addressLabel: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  locationLede: string;
  mapEmbedUrl: string;
  socialLinkedinUrl: string;
  socialInstagramUrl: string;
  socialFacebookUrl: string;
  socialXUrl: string;
};

function toForm(data: SiteContactPublic): SiteContactForm {
  return {
    email: data.email,
    phone: data.phone,
    phoneHref: data.phoneHref,
    addressLabel: data.addressLabel,
    addressLine1: data.addressLines[0] ?? "",
    addressLine2: data.addressLines[1] ?? "",
    addressLine3: data.addressLines[2] ?? "",
    locationLede: data.locationLede,
    mapEmbedUrl: data.mapEmbedUrl,
    socialLinkedinUrl: data.socialLinkedinUrl,
    socialInstagramUrl: data.socialInstagramUrl,
    socialFacebookUrl: data.socialFacebookUrl,
    socialXUrl: data.socialXUrl,
  };
}

function SiteContactEditor() {
  const [version, setVersion] = useState<number | null>(null);
  const [form, setForm] = useState<SiteContactForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getAdminSiteContactAction();
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setError("Could not load public contact details.");
        return;
      }
      setVersion(result.data.version);
      setForm(toForm(result.data));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = () => {
    if (!form || version === null || pending) {
      return;
    }
    startTransition(async () => {
      setError(null);
      setSaved(false);
      const result = await updateAdminSiteContactAction({
        version,
        ...form,
      });
      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "Contact details were updated elsewhere. Refresh and try again."
            : result.reason === "validation"
              ? "Check the fields and try again."
              : "Could not save contact details.",
        );
        return;
      }
      setVersion(result.data.version);
      setForm(toForm(result.data));
      setSaved(true);
    });
  };

  return (
    <div className={`${cardClass} p-5 md:p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            Public contact details
          </h2>
          <p className="mt-1 text-[0.85rem] font-medium text-black/45">
            Shown on Contact, About, footer, and invoices.
          </p>
        </div>
        <button
          type="button"
          disabled={pending || form === null || version === null}
          onClick={save}
          className="rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-[#e8891a]/30 bg-[rgba(249,161,55,0.12)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-brand/25 bg-[rgba(92,104,73,0.1)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
        >
          Saved. Public pages will refresh on next load.
        </p>
      ) : null}

      {form ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={adminLabelClass}>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className={adminFieldClass}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Phone</span>
            <input
              type="text"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              className={adminFieldClass}
            />
          </label>
          <label className="block md:col-span-2">
            <span className={adminLabelClass}>
              Phone link (optional — auto from phone if empty)
            </span>
            <input
              type="text"
              value={form.phoneHref}
              onChange={(e) =>
                setForm({ ...form, phoneHref: e.target.value })
              }
              className={adminFieldClass}
              placeholder="tel:+923079222055"
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Address label</span>
            <input
              type="text"
              value={form.addressLabel}
              onChange={(e) =>
                setForm({ ...form, addressLabel: e.target.value })
              }
              className={adminFieldClass}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Location lede</span>
            <input
              type="text"
              value={form.locationLede}
              onChange={(e) =>
                setForm({ ...form, locationLede: e.target.value })
              }
              className={adminFieldClass}
            />
          </label>
          <label className="block md:col-span-2">
            <span className={adminLabelClass}>Address line 1</span>
            <input
              type="text"
              value={form.addressLine1}
              onChange={(e) =>
                setForm({ ...form, addressLine1: e.target.value })
              }
              className={adminFieldClass}
            />
          </label>
          <label className="block md:col-span-2">
            <span className={adminLabelClass}>Address line 2</span>
            <input
              type="text"
              value={form.addressLine2}
              onChange={(e) =>
                setForm({ ...form, addressLine2: e.target.value })
              }
              className={adminFieldClass}
            />
          </label>
          <label className="block md:col-span-2">
            <span className={adminLabelClass}>Address line 3</span>
            <input
              type="text"
              value={form.addressLine3}
              onChange={(e) =>
                setForm({ ...form, addressLine3: e.target.value })
              }
              className={adminFieldClass}
            />
          </label>
          <label className="block md:col-span-2">
            <span className={adminLabelClass}>Map embed URL</span>
            <input
              type="url"
              value={form.mapEmbedUrl}
              onChange={(e) =>
                setForm({ ...form, mapEmbedUrl: e.target.value })
              }
              className={adminFieldClass}
            />
          </label>

          <div className="md:col-span-2 border-t border-black/8 pt-4">
            <h3 className="text-[0.92rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
              Social links
            </h3>
            <p className="mt-1 text-[0.82rem] font-medium text-black/45">
              Footer icons appear only when a URL is set.
            </p>
          </div>
          <label className="block">
            <span className={adminLabelClass}>LinkedIn URL</span>
            <input
              type="url"
              value={form.socialLinkedinUrl}
              onChange={(e) =>
                setForm({ ...form, socialLinkedinUrl: e.target.value })
              }
              className={adminFieldClass}
              placeholder="https://linkedin.com/company/..."
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Instagram URL</span>
            <input
              type="url"
              value={form.socialInstagramUrl}
              onChange={(e) =>
                setForm({ ...form, socialInstagramUrl: e.target.value })
              }
              className={adminFieldClass}
              placeholder="https://instagram.com/..."
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Facebook URL</span>
            <input
              type="url"
              value={form.socialFacebookUrl}
              onChange={(e) =>
                setForm({ ...form, socialFacebookUrl: e.target.value })
              }
              className={adminFieldClass}
              placeholder="https://facebook.com/..."
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>X URL</span>
            <input
              type="url"
              value={form.socialXUrl}
              onChange={(e) =>
                setForm({ ...form, socialXUrl: e.target.value })
              }
              className={adminFieldClass}
              placeholder="https://x.com/..."
            />
          </label>
        </div>
      ) : (
        <p className="mt-5 text-[0.88rem] font-medium text-black/45">
          Loading…
        </p>
      )}
    </div>
  );
}

function ViewContactModal({
  open,
  message,
  pending,
  onClose,
  onMarkRead,
  onDelete,
}: {
  readonly open: boolean;
  readonly message: AdminContactMessage | null;
  readonly pending: boolean;
  readonly onClose: () => void;
  readonly onMarkRead: () => void;
  readonly onDelete: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const CloseIcon = adminIcons.close;
  const TrashIcon = adminIcons.trash;
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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
          {message.status === "new" ? (
            <button
              type="button"
              disabled={pending}
              onClick={onMarkRead}
              className="rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream disabled:opacity-40"
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
  const { state, setContactMessages } = useAdmin();
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const TrashIcon = adminIcons.trash;

  const selected =
    state.contactMessages.find((item) => item.id === viewId) ?? null;
  const deleteTarget =
    state.contactMessages.find((item) => item.id === deleteId) ?? null;

  const markRead = () => {
    if (!viewId || pending) {
      return;
    }

    const existing = state.contactMessages.find((item) => item.id === viewId);
    if (!existing) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await markAdminContactMessageReadAction({
        id: existing.id,
        version: existing.version,
      });

      if (!result.ok || !("message" in result)) {
        setError(
          !result.ok && result.reason === "conflict"
            ? "This message was updated elsewhere. Refresh and try again."
            : "Could not mark message as read.",
        );
        return;
      }

      setContactMessages(
        state.contactMessages.map((item) =>
          item.id === viewId ? result.message : item,
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
      const result = await deleteAdminContactMessageAction({
        id: deleteTarget.id,
        version: deleteTarget.version,
      });
      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "This message was updated elsewhere. Refresh and try again."
            : "Could not delete message. Try again.",
        );
        return;
      }
      setContactMessages(
        state.contactMessages.filter((item) => item.id !== deleteId),
      );
      if (viewId === deleteId) {
        setViewId(null);
      }
      setDeleteId(null);
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contact"
        lede="Public contact details and messages from the contact form."
      />

      <SiteContactEditor />

      {error ? (
        <p className="rounded-xl border border-[#e8891a]/30 bg-[rgba(249,161,55,0.12)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]">
          {error}
        </p>
      ) : null}

      <div className={cardClass}>
        <div className="border-b border-black/8 px-5 py-4">
          <h2 className="text-[0.95rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            Inbox
          </h2>
        </div>
        <ul className="divide-y divide-black/8">
          {state.contactMessages.map((item) => (
            <li key={item.id}>
              <div className="flex items-stretch gap-1 px-2 py-1 sm:px-3">
                <button
                  type="button"
                  onClick={() => setViewId(item.id)}
                  className="flex min-w-0 flex-1 flex-col gap-1 px-3 py-3 text-left transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
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
                <button
                  type="button"
                  aria-label={`Delete message from ${item.name}`}
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

      <ViewContactModal
        open={Boolean(viewId)}
        message={selected}
        pending={pending}
        onClose={() => {
          if (!pending) {
            setViewId(null);
          }
        }}
        onMarkRead={markRead}
        onDelete={() => {
          if (selected) {
            setError(null);
            setDeleteId(selected.id);
          }
        }}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteId)}
        title="Delete message"
        lede={`Remove message from "${deleteTarget?.name ?? "this contact"}"?`}
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
