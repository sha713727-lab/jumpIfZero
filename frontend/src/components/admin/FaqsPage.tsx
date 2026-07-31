"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminTodayLabel, useAdminDemo } from "@/components/admin/AdminDemoProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import type { AdminFaq } from "@/constants/adminDemo";

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

export function FaqsPage() {
  const { state, setFaqs } = useAdminDemo();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqForm>(emptyForm);

  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: AdminFaq) => {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      active: item.active,
    });
    setModalOpen(true);
  };

  const save = () => {
    const question = form.question.trim();
    if (!question) {
      return;
    }

    const payload: AdminFaq = {
      id: editingId ?? crypto.randomUUID(),
      question,
      answer: form.answer.trim(),
      active: form.active,
      updatedAt: adminTodayLabel(),
    };

    if (editingId) {
      setFaqs(state.faqs.map((item) => (item.id === editingId ? payload : item)));
    } else {
      setFaqs([...state.faqs, payload]);
    }

    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }
    setFaqs(state.faqs.filter((item) => item.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
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

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left">
            <thead>
              <tr className="border-b border-black/8 bg-[#f3f5ef]/60">
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
              {state.faqs.map((item) => (
                <tr key={item.id} className="hover:bg-[#f3f5ef]/40">
                  <td className="px-4 py-3 text-[0.9rem] font-semibold text-[#0d120b]">
                    {item.question}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                        item.active
                          ? "bg-[rgba(116,129,95,0.16)] text-brand"
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
                        aria-label="Edit"
                        onClick={() => openEdit(item)}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
                      >
                        <EditIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={() => {
                          setDeleteId(item.id);
                          setDeleteOpen(true);
                        }}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
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
          <label className={adminLabelClass}>Question</label>
          <input
            className={adminFieldClass}
            value={form.question}
            onChange={(event) =>
              setForm((current) => ({ ...current, question: event.target.value }))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Answer</label>
          <textarea
            className={`${adminFieldClass} min-h-[6rem] resize-y`}
            value={form.answer}
            onChange={(event) =>
              setForm((current) => ({ ...current, answer: event.target.value }))
            }
          />
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
