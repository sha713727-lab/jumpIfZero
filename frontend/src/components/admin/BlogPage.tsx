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
import type { AdminBlogPost } from "@/lib/data/admin";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  active: boolean;
};

const emptyForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  image: "",
  active: true,
};

export function BlogPage() {
  const { state, setBlog } = useAdminDemo();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);

  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: AdminBlogPost) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      image: item.image,
      active: item.active,
    });
    setModalOpen(true);
  };

  const save = () => {
    const title = form.title.trim();
    const slug = form.slug.trim();
    if (!title || !slug) {
      return;
    }

    const payload: AdminBlogPost = {
      id: editingId ?? crypto.randomUUID(),
      title,
      slug,
      excerpt: form.excerpt.trim(),
      image: form.image,
      active: form.active,
      updatedAt: adminTodayLabel(),
    };

    if (editingId) {
      setBlog(state.blog.map((item) => (item.id === editingId ? payload : item)));
    } else {
      setBlog([...state.blog, payload]);
    }

    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }
    setBlog(state.blog.filter((item) => item.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const deleteTarget = state.blog.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blog"
        lede="Manage blog posts shown on the public site."
        actionLabel="Add post"
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
                  Slug
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Excerpt
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8">
              {state.blog.map((item) => (
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
                  <td className="px-4 py-3 text-[0.84rem] font-medium text-black/45">
                    {item.slug}
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
                    <span className="line-clamp-2">{item.excerpt}</span>
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
        title={editingId ? "Edit blog post" : "Add blog post"}
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
          <label className={adminLabelClass}>Slug</label>
          <input
            className={adminFieldClass}
            value={form.slug}
            onChange={(event) =>
              setForm((current) => ({ ...current, slug: event.target.value }))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Excerpt</label>
          <textarea
            className={`${adminFieldClass} min-h-[5rem] resize-y`}
            value={form.excerpt}
            onChange={(event) =>
              setForm((current) => ({ ...current, excerpt: event.target.value }))
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
        title="Delete blog post"
        lede={`Remove "${deleteTarget?.title ?? "this post"}" from the blog?`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
