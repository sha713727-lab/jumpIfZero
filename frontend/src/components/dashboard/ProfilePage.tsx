"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import {
  changePasswordAction,
  updateClientMeAction,
  updateUserMeAction,
} from "@/lib/submitCustomerPortal";
import { profileCopy } from "@/lib/data/dashboard";

type ProfileValues = {
  name: string;
  title: string;
  company: string;
  phone: string;
  location: string;
  clientContactTitle: string;
};

export function ProfilePage() {
  const formId = useId();
  const { state, setUser, setClient, setShell } = useDashboard();
  const [values, setValues] = useState<ProfileValues>({
    name: state.user.name,
    title: state.user.title,
    company: state.client.company,
    phone: state.client.phone,
    location: state.client.location,
    clientContactTitle: state.client.clientContactTitle,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">(
    "idle",
  );
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<
    "idle" | "loading" | "saved" | "error"
  >("idle");

  const setField = <K extends keyof ProfileValues>(
    key: K,
    value: ProfileValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "loading") {
      return;
    }

    setStatus("loading");

    const userResult = await updateUserMeAction({
      version: state.user.version,
      name: values.name,
      title: values.title,
    });

    if (!userResult.ok) {
      setStatus("error");
      return;
    }

    const clientResult = await updateClientMeAction({
      version: state.client.version,
      company: values.company,
      phone: values.phone,
      location: values.location,
      clientContactTitle: values.clientContactTitle,
    });

    if (!clientResult.ok) {
      setStatus("error");
      return;
    }

    setUser(userResult.data.user);
    setClient(clientResult.data.client);
    setShell(clientResult.data.shell);
    setStatus("saved");
  };

  const savePassword = async () => {
    if (
      passwordStatus === "loading" ||
      !currentPassword ||
      !newPassword ||
      newPassword !== confirmPassword
    ) {
      setPasswordStatus("error");
      return;
    }

    setPasswordStatus("loading");
    const result = await changePasswordAction({
      currentPassword,
      newPassword,
    });

    if (!result.ok) {
      setPasswordStatus("error");
      return;
    }

    setPasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStatus("saved");
  };

  const fieldClass = `${adminFieldClass} mt-2`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          {profileCopy.title}
        </h1>
        <p className="mt-2 text-[0.95rem] font-medium text-black/50">
          {profileCopy.lede}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <aside className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)]">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex size-16 items-center justify-center rounded-full bg-logo-gradient text-[1.1rem] font-extrabold text-[#0d120b]">
              {state.shell.initials}
            </span>
            <p className="mt-3 text-[1rem] font-extrabold text-[#0d120b]">
              {values.name}
            </p>
            <p className="text-[0.82rem] font-medium text-black/45">
              {values.company}
            </p>
            <p className="mt-3 rounded-full bg-[rgba(92, 104, 73,0.14)] px-3 py-1 text-[0.7rem] font-extrabold tracking-[0.1em] text-brand uppercase">
              {state.shell.plan}
            </p>
            <p className="mt-3 text-[0.78rem] font-medium text-black/40">
              Member since {state.shell.memberSince}
            </p>
            <p className="mt-2 text-[0.78rem] font-semibold text-black/45">
              {state.shell.status}
            </p>
          </div>
        </aside>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6"
        >
          {status === "saved" ? (
            <p
              role="status"
              className="mb-4 rounded-xl border border-brand/25 bg-[rgba(92, 104, 73,0.1)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
            >
              {profileCopy.saved}
            </p>
          ) : null}
          {status === "error" ? (
            <p
              role="status"
              className="mb-4 rounded-xl border border-[#e8891a]/30 bg-[rgba(249,161,55,0.12)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
            >
              Could not save your profile. Refresh and try again.
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["name", "Full name", values.name],
                ["title", "Title", values.title],
                ["company", "Company", values.company],
                ["clientContactTitle", "Contact title", values.clientContactTitle],
                ["phone", "Phone", values.phone],
                ["location", "Location", values.location],
              ] as const
            ).map(([key, label, value]) => (
              <div key={key}>
                <label
                  htmlFor={`${formId}-${key}`}
                  className={adminLabelClass}
                >
                  {label}
                </label>
                <input
                  id={`${formId}-${key}`}
                  name={key}
                  type="text"
                  value={value}
                  onChange={(event) => setField(key, event.target.value)}
                  required
                  className={fieldClass}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label
                htmlFor={`${formId}-email`}
                className={adminLabelClass}
              >
                Email
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                value={state.user.email}
                readOnly
                className={`${fieldClass} opacity-70`}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-xl bg-logo-gradient px-5 py-2.5 text-[0.82rem] font-extrabold text-[#0d120b] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-70"
            >
              {status === "loading" ? profileCopy.saving : profileCopy.save}
            </button>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="rounded-xl border border-black/12 px-5 py-2.5 text-[0.82rem] font-extrabold text-[#0d120b] transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              Change password
            </button>
          </div>
        </form>
      </div>

      <AdminFormModal
        open={passwordOpen}
        title="Change password"
        onClose={() => {
          setPasswordOpen(false);
          setPasswordStatus("idle");
        }}
        onSubmit={() => {
          void savePassword();
        }}
        submitLabel={passwordStatus === "loading" ? "Updating…" : "Update password"}
      >
        <div>
          <label className="block">
            <span className={adminLabelClass}>Current password</span>
            <input
              type="password"
              className={adminFieldClass}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>New password</span>
            <input
              type="password"
              className={adminFieldClass}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Confirm password</span>
            <input
              type="password"
              className={adminFieldClass}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        </div>
        {passwordStatus === "error" ? (
          <p className="text-[0.84rem] font-semibold text-[#e8891a]">
            Check your current password and that both new fields match.
          </p>
        ) : null}
        {passwordStatus === "saved" ? (
          <p className="text-[0.84rem] font-semibold text-brand">
            Password updated.
          </p>
        ) : null}
      </AdminFormModal>
    </div>
  );
}
