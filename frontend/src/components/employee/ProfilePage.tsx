"use client";

import Image from "next/image";
import { useState } from "react";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import { useEmployeeDemo } from "@/components/employee/EmployeeDemoProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";

const cardClass =
  "rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6";

export function ProfilePage() {
  const { state } = useEmployeeDemo();
  const { employee } = state;
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const initials = employee.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
      <EmployeePageHeader
        title="Profile"
        lede="Your employee account details."
      />

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <aside className={cardClass}>
          <div className="flex flex-col items-center text-center">
            {employee.image ? (
              <div className="relative size-16 overflow-hidden rounded-full border border-black/8">
                <Image
                  src={employee.image}
                  alt={employee.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <span className="inline-flex size-16 items-center justify-center rounded-full bg-logo-gradient text-[1.1rem] font-extrabold text-[#0d120b]">
                {initials}
              </span>
            )}
            <p className="mt-3 text-[1rem] font-extrabold text-[#0d120b]">
              {employee.name}
            </p>
            <p className="text-[0.82rem] font-medium text-black/45">
              {employee.department}
            </p>
          </div>
        </aside>

        <section className={cardClass}>
          <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            Account
          </h2>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="text-[0.84rem] font-medium text-black/45">Name</dt>
              <dd className="text-[0.88rem] font-semibold text-[#0d120b]">
                {employee.name}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[0.84rem] font-medium text-black/45">Email</dt>
              <dd className="text-[0.88rem] font-semibold text-[#0d120b]">
                {employee.email}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[0.84rem] font-medium text-black/45">Role</dt>
              <dd className="text-[0.88rem] font-semibold text-[#0d120b]">
                {employee.role}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[0.84rem] font-medium text-black/45">
                Department
              </dt>
              <dd className="text-[0.88rem] font-semibold text-[#0d120b]">
                {employee.department}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-6 rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream transition-colors hover:bg-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            Change password
          </button>
        </section>
      </div>

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
