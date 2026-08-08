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
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import type { AdminService } from "@/lib/data/admin";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import {
  archiveAdminServiceAction,
  createAdminServiceAction,
  updateAdminServiceAction,
} from "@/lib/submitAdminService";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type ServiceForm = {
  title: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
};

const emptyForm: ServiceForm = {
  title: "",
  slug: "",
  description: "",
  image: "",
  active: true,
};

function servicePathFromSlug(slug: string): string {
  const trimmed = slug.trim();
  return trimmed.length > 0 ? `/services/${trimmed}` : "/services";
}

export function ServicesPage() {
  const { state, setServices } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (service: AdminService) => {
    setEditingId(service.id);
    setForm({
      title: service.title,
      slug: service.slug,
      description: service.description,
      image: service.image,
      active: service.active,
    });
    setError(null);
    setModalOpen(true);
  };

  const openDelete = (id: string) => {
    setDeleteId(id);
    setError(null);
    setDeleteOpen(true);
  };

  const save = () => {
    const title = form.title.trim();
    const slug = form.slug.trim();
    if (!title || !slug) {
      return;
    }

    const path = servicePathFromSlug(slug);

    startTransition(async () => {
      setError(null);

      if (editingId) {
        const existing = state.services.find((item) => item.id === editingId);
        if (!existing) {
          setError("Service not found.");
          return;
        }

        const result = await updateAdminServiceAction({
          id: existing.id,
          version: existing.version,
          title,
          slug,
          description: form.description.trim(),
          path,
          image: form.image,
          active: form.active,
          publishedAt: existing.publishedAt,
        });

        if (!result.ok || !("service" in result)) {
          setError(
            result.ok
              ? "Save failed."
              : result.reason === "conflict"
                ? "This service was updated elsewhere. Refresh and try again."
                : "Could not save service.",
          );
          return;
        }

        setServices(
          state.services.map((item) =>
            item.id === editingId ? result.service : item,
          ),
        );
      } else {
        const result = await createAdminServiceAction({
          title,
          slug,
          description: form.description.trim(),
          path,
          image: form.image,
          active: form.active,
        });

        if (!result.ok || !("service" in result)) {
          setError("Could not create service.");
          return;
        }

        setServices([...state.services, result.service]);
      }

      setModalOpen(false);
    });
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    const existing = state.services.find((item) => item.id === deleteId);
    if (!existing) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await archiveAdminServiceAction({
        id: existing.id,
        version: existing.version,
      });

      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "This service was updated elsewhere. Refresh and try again."
            : "Could not delete service.",
        );
        return;
      }

      setServices(state.services.filter((item) => item.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    });
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

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

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
                            src={cmsMediaSrc(service.image)}
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
                          ? "bg-[rgba(92, 104, 73,0.16)] text-brand"
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
                        aria-label="Edit"
                        disabled={pending}
                        onClick={() => openEdit(service)}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                      >
                        <EditIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        disabled={pending}
                        onClick={() => openDelete(service.id)}
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
          <span className={adminLabelClass}>Path</span>
          <p
            className={`${adminFieldClass} bg-[#f3f5ef]/70 text-black/55`}
            aria-live="polite"
          >
            {servicePathFromSlug(form.slug)}
          </p>
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
