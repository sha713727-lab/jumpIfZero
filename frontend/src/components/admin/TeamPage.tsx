"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
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
import type { AdminTeamMember } from "@/lib/data/admin";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import {
  archiveAdminTeamMemberAction,
  createAdminTeamMemberAction,
  reorderAdminTeamMemberAction,
  updateAdminTeamMemberAction,
} from "@/lib/submitAdminTeam";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type TeamForm = {
  name: string;
  role: string;
  bio: string;
  image: string;
  active: boolean;
  employeeId: string;
};

const emptyForm: TeamForm = {
  name: "",
  role: "",
  bio: "",
  image: "",
  active: true,
  employeeId: "",
};

function nextSortOrder(team: readonly AdminTeamMember[]): number {
  if (team.length === 0) {
    return 0;
  }
  return Math.max(...team.map((item) => item.sortOrder)) + 1;
}

export function TeamPage() {
  const { state, setTeam } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<TeamForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;
  const ChevronUpIcon = adminIcons.chevronUp;
  const ChevronDownIcon = adminIcons.chevronDown;

  const sortedTeam = useMemo(
    () => [...state.team].sort((a, b) => a.sortOrder - b.sortOrder),
    [state.team],
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (item: AdminTeamMember) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      role: item.role,
      bio: item.bio,
      image: item.image,
      active: item.active,
      employeeId: item.employeeId ?? "",
    });
    setError(null);
    setModalOpen(true);
  };

  const save = () => {
    const name = form.name.trim();
    if (!name) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const employeeId = form.employeeId || null;

      if (editingId) {
        const existing = state.team.find((item) => item.id === editingId);
        if (!existing) {
          setError("Team member not found.");
          return;
        }

        const result = await updateAdminTeamMemberAction({
          id: existing.id,
          version: existing.version,
          name,
          role: form.role.trim(),
          bio: form.bio.trim(),
          image: form.image,
          employeeId,
          sortOrder: existing.sortOrder,
          active: form.active,
          publishedAt: existing.publishedAt,
          socials: existing.socials,
        });

        if (!result.ok || !("member" in result)) {
          setError(
            result.ok
              ? "Save failed."
              : result.reason === "conflict"
                ? "This member was updated elsewhere. Refresh and try again."
                : "Could not save team member.",
          );
          return;
        }

        setTeam(
          state.team.map((item) =>
            item.id === editingId ? result.member : item,
          ),
        );
      } else {
        const result = await createAdminTeamMemberAction({
          name,
          role: form.role.trim(),
          bio: form.bio.trim(),
          image: form.image,
          employeeId,
          sortOrder: nextSortOrder(state.team),
          active: form.active,
          socials: [],
        });

        if (!result.ok || !("member" in result)) {
          setError("Could not create team member.");
          return;
        }

        setTeam([...state.team, result.member]);
      }

      setModalOpen(false);
    });
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    const existing = state.team.find((item) => item.id === deleteId);
    if (!existing) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await archiveAdminTeamMemberAction({
        id: existing.id,
        version: existing.version,
      });

      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "This member was updated elsewhere. Refresh and try again."
            : "Could not delete team member.",
        );
        return;
      }

      setTeam(state.team.filter((item) => item.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    });
  };

  const move = (index: number, direction: "up" | "down") => {
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    const current = sortedTeam[index];
    const neighbor = sortedTeam[neighborIndex];
    if (!current || !neighbor) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await reorderAdminTeamMemberAction({
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
            : "Could not reorder team member.",
        );
        return;
      }

      setTeam(
        state.team.map((item) => {
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

  const deleteTarget = state.team.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Team"
        lede="Public team members shown on the about page."
        actionLabel="Add member"
        onAction={openAdd}
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left">
            <thead>
              <tr className="border-b border-black/8 bg-[#f3f5ef]/60">
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Bio
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8">
              {sortedTeam.map((item, index) => (
                <tr key={item.id} className="hover:bg-[#f3f5ef]/40">
                  <td className="px-4 py-3 text-[0.84rem] font-bold text-black/35">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-black/8">
                          <Image
                            src={cmsMediaSrc(item.image)}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : null}
                      <span className="text-[0.9rem] font-semibold text-[#0d120b]">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[0.84rem] font-medium text-black/50">
                    {item.role}
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
                  <td className="max-w-[16rem] px-4 py-3 text-[0.84rem] font-medium text-black/50">
                    <span className="line-clamp-2">{item.bio}</span>
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
                        disabled={pending || index === sortedTeam.length - 1}
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
        title={editingId ? "Edit team member" : "Add team member"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
      >
        <div>
          <label className="block">
            <span className={adminLabelClass}>Name</span>
            <input
              className={adminFieldClass}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Role</span>
            <input
              className={adminFieldClass}
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value }))
              }
            />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Bio</span>
            <textarea
              className={`${adminFieldClass} min-h-[5rem] resize-y`}
              value={form.bio}
              onChange={(event) =>
                setForm((current) => ({ ...current, bio: event.target.value }))
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
            <span className={adminLabelClass}>Linked employee</span>
            <select
              className={adminFieldClass}
              value={form.employeeId}
              onChange={(event) =>
                setForm((current) => ({ ...current, employeeId: event.target.value }))
              }
            >
              <option value="">None</option>
              {state.employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
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
        title="Delete team member"
        lede={`Remove "${deleteTarget?.name ?? "this member"}" from the public team?`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
