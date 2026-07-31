"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { demoAdmin } from "@/constants/adminAuth";

const cardClass =
  "rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6";

export function SecurityPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const save = () => {
    if (!password || password !== confirm) {
      return;
    }
    setModalOpen(false);
    setPassword("");
    setConfirm("");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Security"
        lede="Admin account credentials and access."
      />

      <section className={cardClass}>
        <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
          Admin account
        </h2>
        <dl className="mt-4 space-y-3">
          <div className="flex justify-between gap-4">
            <dt className="text-[0.84rem] font-medium text-black/45">Name</dt>
            <dd className="text-[0.88rem] font-semibold text-[#0d120b]">
              {demoAdmin.name}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[0.84rem] font-medium text-black/45">Email</dt>
            <dd className="text-[0.88rem] font-semibold text-[#0d120b]">
              {demoAdmin.email}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[0.84rem] font-medium text-black/45">Role</dt>
            <dd className="text-[0.88rem] font-semibold text-[#0d120b]">
              {demoAdmin.role}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-6 rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream"
        >
          Change password
        </button>
      </section>

      <AdminFormModal
        open={modalOpen}
        title="Change password"
        onClose={() => setModalOpen(false)}
        onSubmit={save}
        submitLabel="Update password"
      >
        <div>
          <label className={adminLabelClass}>New password</label>
          <input
            type="password"
            className={adminFieldClass}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div>
          <label className={adminLabelClass}>Confirm password</label>
          <input
            type="password"
            className={adminFieldClass}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </div>
      </AdminFormModal>
    </div>
  );
}
