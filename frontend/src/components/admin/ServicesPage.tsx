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
import type { AdminService } from "@/lib/data/admin";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type ServiceForm = {
  title: string;
  slug: string;
  description: string;
  path: string;
  image: string;
  active: boolean;
};

const emptyForm: ServiceForm = {
  title: "",
  slug: "",
  description: "",
  path: "/services",
  image: "",
  active: true,
};

export function ServicesPage() {
  const { state, setServices } = useAdminDemo();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);

  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;
  const ChevronUpIcon = adminIcons.chevronUp;
  const ChevronDownIcon = adminIcons.chevronDown;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (service: AdminService) => {
    setEditingId(service.id);
    setForm({
      title: service.title,
      slug: service.slug,
      description: service.description,
      path: service.path,
      image: service.image,
      active: service.active,
    });
    setModalOpen(true);
  };

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const save = () => {
    const title = form.title.trim();
    const slug = form.slug.trim();
    if (!title || !slug) {
      return;
    }

    const payload: AdminService = {
      id: editingId ?? `svc_${Date.now()}`,
      title,
      slug,
      description: form.description.trim(),
      path: form.path.trim(),
      image: form.image,
      active: form.active,
      updatedAt: adminTodayLabel(),
    };

    if (editingId) {
      setServices(
        state.services.map((item) => (item.id === editingId ? payload : item)),
      );
    } else {
      setServices([...state.services, payload]);
    }

    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }
    setServices(state.services.filter((item) => item.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= state.services.length) {
      return;
    }
    const items = [...state.services];
    const current = items[index];
    const swap = items[nextIndex];
    if (!current || !swap) {
      return;
    }
    items[index] = swap;
    items[nextIndex] = current;
    setServices(items);
  };

  const deleteTarget = state.services.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        lede="Manage public service offerings and landing paths."
        actionLabel="Add service"
        onAction={openAdd}
      />

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left">
            <thead>
              <tr className="border-b border-black/8 bg-[#f3f5ef]/60">
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Path
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8">
              {state.services.map((service, index) => (
                <tr key={service.id} className="hover:bg-[#f3f5ef]/40">
                  <td className="px-4 py-3 text-[0.84rem] font-bold text-black/35">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {service.image ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-black/8">
                          <Image
                            src={service.image}
                            alt={service.title}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : null}
                      <span className="text-[0.9rem] font-semibold text-[#0d120b]">
                        {service.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                        service.active
                          ? "bg-[rgba(116,129,95,0.16)] text-brand"
                          : "bg-black/8 text-black/45"
                      }`}
                    >
                      {service.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="max-w-[14rem] px-4 py-3 text-[0.84rem] font-medium text-black/50">
                    <span className="line-clamp-2">{service.description}</span>
                  </td>
                  <td className="px-4 py-3 text-[0.84rem] font-medium text-black/45">
                    {service.path}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Move up"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                      >
                        <ChevronUpIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        disabled={index === state.services.length - 1}
                        onClick={() => move(index, 1)}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                      >
                        <ChevronDownIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Edit"
                        onClick={() => openEdit(service)}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
                      >
                        <EditIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={() => openDelete(service.id)}
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
        title={editingId ? "Edit service" : "Add service"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
        submitLabel={editingId ? "Save changes" : "Add service"}
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
            <span className={adminLabelClass}>Description</span>
            <textarea
            className={`${adminFieldClass} min-h-[5rem] resize-y`}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
          </label>
        </div>
        <AdminImageField
          label="Image"
          value={form.image}
          onChange={(image) => setForm((current) => ({ ...current, image }))}
        />
        <div>
          <label className="block">
            <span className={adminLabelClass}>Path</span>
            <input
            className={adminFieldClass}
            value={form.path}
            onChange={(event) =>
              setForm((current) => ({ ...current, path: event.target.value }))
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
        title="Delete service"
        lede={`Remove "${deleteTarget?.title ?? "this service"}" from the catalog?`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
