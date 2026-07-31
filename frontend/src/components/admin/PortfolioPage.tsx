"use client";

import Image from "next/image";
import { useState } from "react";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminTodayLabel, useAdminDemo } from "@/components/admin/AdminDemoProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import type { AdminPortfolioItem } from "@/lib/data/admin";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type PortfolioForm = {
  title: string;
  category: string;
  summary: string;
  image: string;
  active: boolean;
};

const emptyForm: PortfolioForm = {
  title: "",
  category: "",
  summary: "",
  image: "",
  active: true,
};

export function PortfolioPage() {
  const { state, setPortfolio } = useAdminDemo();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<PortfolioForm>(emptyForm);

  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: AdminPortfolioItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      summary: item.summary,
      image: item.image,
      active: item.active,
    });
    setModalOpen(true);
  };

  const save = () => {
    const title = form.title.trim();
    if (!title) {
      return;
    }

    const payload: AdminPortfolioItem = {
      id: editingId ?? crypto.randomUUID(),
      title,
      category: form.category.trim(),
      summary: form.summary.trim(),
      image: form.image,
      active: form.active,
      updatedAt: adminTodayLabel(),
    };

    if (editingId) {
      setPortfolio(
        state.portfolio.map((item) => (item.id === editingId ? payload : item)),
      );
    } else {
      setPortfolio([...state.portfolio, payload]);
    }

    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }
    setPortfolio(state.portfolio.filter((item) => item.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const deleteTarget = state.portfolio.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Portfolio"
        lede="Showcase work samples on the public portfolio page."
        actionLabel="Add item"
        onAction={openAdd}
      />

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left">
            <thead>
              <tr className="border-b border-black/8 bg-[#f3f5ef]/60">
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Summary
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8">
              {state.portfolio.map((item) => (
                <tr key={item.id} className="hover:bg-[#f3f5ef]/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-black/8">
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : null}
                      <span className="text-[0.9rem] font-semibold text-[#0d120b]">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[0.84rem] font-medium text-black/50">
                    {item.category}
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
                  <td className="max-w-[16rem] px-4 py-3 text-[0.84rem] font-medium text-black/50">
                    <span className="line-clamp-2">{item.summary}</span>
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
        title={editingId ? "Edit portfolio item" : "Add portfolio item"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
      >
        <div>
          <label className={adminLabelClass}>Title</label>
          <input
            className={adminFieldClass}
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Category</label>
          <input
            className={adminFieldClass}
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({ ...current, category: event.target.value }))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Summary</label>
          <textarea
            className={`${adminFieldClass} min-h-[5rem] resize-y`}
            value={form.summary}
            onChange={(event) =>
              setForm((current) => ({ ...current, summary: event.target.value }))
            }
          />
        </div>
        <AdminImageField
          label="Image"
          value={form.image}
          onChange={(image) => setForm((current) => ({ ...current, image }))}
        />
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
        title="Delete portfolio item"
        lede={`Remove "${deleteTarget?.title ?? "this item"}" from the portfolio?`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
