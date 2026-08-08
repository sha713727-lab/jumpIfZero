"use client";

import { useMemo, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import type { AdminFaq } from "@/lib/data/admin";
import {
  archiveAdminFaqAction,
  createAdminFaqAction,
  reorderAdminFaqAction,
  updateAdminFaqAction,
} from "@/lib/submitAdminFaqs";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type FaqForm = {
  question: string;
  answer: string;
  active: boolean;
};

const emptyForm: FaqForm = {
  question: "",
  answer: "",
  active: true,
};

function nextSortOrder(faqs: readonly AdminFaq[]): number {
  if (faqs.length === 0) {
    return 0;
  }
  return Math.max(...faqs.map((item) => item.sortOrder)) + 1;
}

export function FaqsPage() {
  const { state, setFaqs } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;
  const ChevronUpIcon = adminIcons.chevronUp;
  const ChevronDownIcon = adminIcons.chevronDown;

  const sortedFaqs = useMemo(
    () => [...state.faqs].sort((a, b) => a.sortOrder - b.sortOrder),
    [state.faqs],
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (item: AdminFaq) => {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      active: item.active,
    });
    setError(null);
    setModalOpen(true);
  };

  const save = () => {
    const question = form.question.trim();
    if (!question) {
      return;
    }

    startTransition(async () => {
      setError(null);

      if (editingId) {
        const existing = state.faqs.find((item) => item.id === editingId);
        if (!existing) {
          setError("FAQ not found.");
          return;
        }

        const result = await updateAdminFaqAction({
          id: existing.id,
          version: existing.version,
          question,
          answer: form.answer.trim(),
          sortOrder: existing.sortOrder,
          active: form.active,
          publishedAt: existing.publishedAt,
        });

        if (!result.ok || !("faq" in result)) {
          setError(
            result.ok
              ? "Save failed."
              : result.reason === "conflict"
                ? "This FAQ was updated elsewhere. Refresh and try again."
                : "Could not save FAQ.",
          );
          return;
        }

        setFaqs(
          state.faqs.map((item) =>
            item.id === editingId ? result.faq : item,
          ),
        );
      } else {
        const result = await createAdminFaqAction({
          question,
          answer: form.answer.trim(),
          sortOrder: nextSortOrder(state.faqs),
          active: form.active,
        });

        if (!result.ok || !("faq" in result)) {
          setError("Could not create FAQ.");
          return;
        }

        setFaqs([...state.faqs, result.faq]);
      }

      setModalOpen(false);
    });
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    const existing = state.faqs.find((item) => item.id === deleteId);
    if (!existing) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await archiveAdminFaqAction({
        id: existing.id,
        version: existing.version,
      });

      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "This FAQ was updated elsewhere. Refresh and try again."
            : "Could not delete FAQ.",
        );
        return;
      }

      setFaqs(state.faqs.filter((item) => item.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    });
  };

  const move = (index: number, direction: "up" | "down") => {
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    const current = sortedFaqs[index];
    const neighbor = sortedFaqs[neighborIndex];
    if (!current || !neighbor) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await reorderAdminFaqAction({
        items: [
          {
            id: current.id,
            sortOrder: neighbor.sortOrder,
            version: current.version,
          },
          {
            id: neighbor.id,
            sortOrder: current.sortOrder,
            version: neighbor.version,
          },
        ],
      });

      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "Order changed elsewhere. Refresh and try again."
            : "Could not reorder FAQ.",
        );
        return;
      }

      setFaqs(
        state.faqs.map((item) => {
          if (item.id === current.id) {
            return {
              ...item,
              sortOrder: neighbor.sortOrder,
              version: item.version + 1,
            };
          }
          if (item.id === neighbor.id) {
            return {
              ...item,
              sortOrder: current.sortOrder,
              version: item.version + 1,
            };
          }
          return item;
        }),
      );
    });
  };

  const deleteTarget = state.faqs.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="FAQs"
        lede="Manage frequently asked questions on the public site."
        actionLabel="Add FAQ"
        onAction={openAdd}
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left">
            <thead>
              <tr className="border-b border-black/8 bg-[#f3f5ef]/60">
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Question
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Answer
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8">
              {sortedFaqs.map((item, index) => (
                <tr key={item.id} className="hover:bg-[#f3f5ef]/40">
                  <td className="px-4 py-3 text-[0.84rem] font-bold text-black/35">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-[0.9rem] font-semibold text-[#0d120b]">
                    {item.question}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                        item.active
                          ? "bg-[rgba(92, 104, 73,0.16)] text-brand"
                          : "bg-black/8 text-black/45"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="max-w-[20rem] px-4 py-3 text-[0.84rem] font-medium text-black/50">
                    <span className="line-clamp-2">{item.answer}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Move up"
                        disabled={pending || index === 0}
                        onClick={() => move(index, "up")}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                      >
                        <ChevronUpIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        disabled={pending || index === sortedFaqs.length - 1}
                        onClick={() => move(index, "down")}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                      >
                        <ChevronDownIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Edit"
                        disabled={pending}
                        onClick={() => openEdit(item)}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                      >
                        <EditIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        disabled={pending}
                        onClick={() => {
                          setDeleteId(item.id);
                          setDeleteOpen(true);
                        }}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminFormModal
        open={modalOpen}
        title={editingId ? "Edit FAQ" : "Add FAQ"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
      >
        <div>
          <label className="block">
            <span className={adminLabelClass}>Question</span>
            <input
              className={adminFieldClass}
              value={form.question}
              onChange={(event) =>
                setForm((current) => ({ ...current, question: event.target.value }))
              }
            />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Answer</span>
            <textarea
              className={`${adminFieldClass} min-h-[6rem] resize-y`}
              value={form.answer}
              onChange={(event) =>
                setForm((current) => ({ ...current, answer: event.target.value }))
              }
            />
          </label>
        </div>
        <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setForm((current) => ({ ...current, active: event.target.checked }))
            }
          />
          Active on site
        </label>
      </AdminFormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete FAQ"
        lede={`Remove "${deleteTarget?.question ?? "this FAQ"}" from the site?`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
