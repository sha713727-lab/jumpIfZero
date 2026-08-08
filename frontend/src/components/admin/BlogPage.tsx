"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { BlogBodyEditor } from "@/components/admin/BlogBodyEditor";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import type { AdminBlogPost } from "@/lib/data/admin";
import {
  createEmptyBlogBody,
  parseBlogBody,
  serializeBlogBody,
  type BlogBodyDocument,
} from "@/lib/blogBody";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import {
  archiveAdminBlogPostAction,
  createAdminBlogPostAction,
  getAdminBlogPostAction,
  updateAdminBlogPostAction,
} from "@/lib/submitAdminBlog";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  body: BlogBodyDocument;
  category: string;
  image: string;
  active: boolean;
};

const emptyForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  body: createEmptyBlogBody(),
  category: "",
  image: "",
  active: true,
};

export function BlogPage() {
  const { state, setBlog } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, body: createEmptyBlogBody() });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (item: AdminBlogPost) => {
    setEditingId(item.id);
    setError(null);
    setModalOpen(true);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      body: parseBlogBody(item.body),
      category: item.category,
      image: item.image,
      active: item.active,
    });

    startTransition(async () => {
      const result = await getAdminBlogPostAction({ id: item.id });
      if (!result.ok || !("post" in result)) {
        setError("Could not load blog post body.");
        return;
      }

      const post = result.post;
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: parseBlogBody(post.body),
        category: post.category,
        image: post.image,
        active: post.active,
      });
      setBlog(
        state.blog.map((entry) =>
          entry.id === post.id ? { ...post, body: "" } : entry,
        ),
      );
    });
  };

  const save = () => {
    const title = form.title.trim();
    const slug = form.slug.trim();
    if (!title || !slug) {
      return;
    }

    const body = serializeBlogBody(form.body);

    startTransition(async () => {
      setError(null);

      if (editingId) {
        const existing = state.blog.find((item) => item.id === editingId);
        if (!existing) {
          setError("Blog post not found.");
          return;
        }

        const result = await updateAdminBlogPostAction({
          id: existing.id,
          version: existing.version,
          title,
          slug,
          excerpt: form.excerpt.trim(),
          body,
          category: form.category.trim(),
          image: form.image,
          active: form.active,
          publishedAt: existing.publishedAt,
        });

        if (!result.ok || !("post" in result)) {
          setError(
            result.ok
              ? "Save failed."
              : result.reason === "conflict"
                ? "This post was updated elsewhere. Refresh and try again."
                : "Could not save blog post.",
          );
          return;
        }

        setBlog(
          state.blog.map((item) =>
            item.id === editingId ? { ...result.post, body: "" } : item,
          ),
        );
      } else {
        const result = await createAdminBlogPostAction({
          title,
          slug,
          excerpt: form.excerpt.trim(),
          body,
          category: form.category.trim(),
          image: form.image,
          active: form.active,
        });

        if (!result.ok || !("post" in result)) {
          setError("Could not create blog post.");
          return;
        }

        setBlog([...state.blog, { ...result.post, body: "" }]);
      }

      setModalOpen(false);
    });
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    const existing = state.blog.find((item) => item.id === deleteId);
    if (!existing) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await archiveAdminBlogPostAction({
        id: existing.id,
        version: existing.version,
      });

      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "This post was updated elsewhere. Refresh and try again."
            : "Could not delete blog post.",
        );
        return;
      }

      setBlog(state.blog.filter((item) => item.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    });
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
                  Title
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Category
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
                            src={cmsMediaSrc(item.image)}
                            alt={item.title}
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
                          ? "bg-[rgba(92,104,73,0.16)] text-brand"
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
        wide
        title={editingId ? "Edit blog post" : "Add blog post"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
      >
        <div>
          <label className="block">
            <span className={adminLabelClass}>Title</span>
            <input
              className={adminFieldClass}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Slug</span>
            <input
              className={adminFieldClass}
              value={form.slug}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
              }
            />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Excerpt</span>
            <textarea
              className={`${adminFieldClass} min-h-[5rem] resize-y`}
              value={form.excerpt}
              onChange={(event) =>
                setForm((current) => ({ ...current, excerpt: event.target.value }))
              }
            />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Category</span>
            <input
              className={adminFieldClass}
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
            />
          </label>
        </div>
        <AdminImageField
          label="Cover image"
          value={form.image}
          onChange={(image) => setForm((current) => ({ ...current, image }))}
        />
        <BlogBodyEditor
          value={form.body}
          onChange={(body) => setForm((current) => ({ ...current, body }))}
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
