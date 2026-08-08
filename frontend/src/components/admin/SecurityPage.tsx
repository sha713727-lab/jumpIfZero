"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  changeAdminPasswordAction,
  getAdminMeAction,
  updateAdminAccountAction,
} from "@/lib/submitAdminSecurity";

const cardClass =
  "rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6";

export function SecurityPage() {
  const { setIdentity } = useAdmin();
  const [userId, setUserId] = useState("");
  const [version, setVersion] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("Admin");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const EyeIcon = adminIcons.eye;
  const EyeOffIcon = adminIcons.eyeOff;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getAdminMeAction();
      if (cancelled) {
        return;
      }
      if (!result.ok || !("profile" in result)) {
        setLoadError("Could not load admin account.");
        setLoading(false);
        return;
      }
      setUserId(result.profile.id);
      setVersion(result.profile.version);
      setName(result.profile.name);
      setEmail(result.profile.email);
      setTitle(result.profile.title ?? "");
      setRole(
        result.profile.role.length > 0
          ? `${result.profile.role[0]?.toUpperCase() ?? ""}${result.profile.role.slice(1)}`
          : "Admin",
      );
      setIdentity({
        name: result.profile.name,
        email: result.profile.email,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [setIdentity]);

  const saveAccount = () => {
    if (pending || userId.length === 0) {
      return;
    }
    if (name.trim().length === 0 || email.trim().length === 0) {
      setSaveError("Name and email are required.");
      setSaveStatus("idle");
      return;
    }

    startTransition(async () => {
      setSaveError(null);
      setSaveStatus("idle");
      const result = await updateAdminAccountAction({
        userId,
        version,
        name,
        email,
        title,
      });
      if (!result.ok || !("account" in result)) {
        setSaveError(
          result.ok
            ? "Could not save account. Try again."
            : result.reason === "conflict"
              ? "Account was updated elsewhere. Refresh and try again."
              : result.reason === "validation"
                ? "Check the fields and try again."
                : "Could not save account. Try again.",
        );
        return;
      }
      setVersion(result.account.version);
      setName(result.account.name);
      setEmail(result.account.email);
      setTitle(result.account.title ?? "");
      setIdentity({
        name: result.account.name,
        email: result.account.email,
      });
      setSaveStatus("saved");
    });
  };

  const savePassword = async () => {
    if (
      passwordStatus === "loading" ||
      !currentPassword ||
      !password ||
      password !== confirm ||
      password.length < 8
    ) {
      setPasswordStatus("error");
      return;
    }

    setPasswordStatus("loading");
    const result = await changeAdminPasswordAction({
      currentPassword,
      newPassword: password,
    });

    if (!result.ok) {
      setPasswordStatus("error");
      return;
    }

    setModalOpen(false);
    setCurrentPassword("");
    setPassword("");
    setConfirm("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setPasswordStatus("idle");
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
        {loading ? (
          <p className="mt-4 text-[0.88rem] font-medium text-black/45">
            Loading…
          </p>
        ) : loadError ? (
          <p className="mt-4 text-[0.88rem] font-semibold text-[#e8891a]">
            {loadError}
          </p>
        ) : (
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveAccount();
            }}
          >
            <div>
              <label className="block">
                <span className={adminLabelClass}>Name</span>
                <input
                  className={adminFieldClass}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Email</span>
                <input
                  type="email"
                  className={adminFieldClass}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Role name</span>
                <input
                  className={adminFieldClass}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
            </div>
            <div className="flex justify-between gap-4 rounded-xl border border-black/8 bg-[#f3f5ef]/60 px-4 py-3">
              <span className="text-[0.84rem] font-medium text-black/45">
                Access role
              </span>
              <span className="text-[0.88rem] font-semibold text-[#0d120b]">
                {role}
              </span>
            </div>
            {saveError ? (
              <p className="text-[0.84rem] font-semibold text-[#e8891a]">
                {saveError}
              </p>
            ) : null}
            {saveStatus === "saved" ? (
              <p className="text-[0.84rem] font-semibold text-brand">
                Account updated.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasswordStatus("idle");
                  setShowCurrentPassword(false);
                  setShowNewPassword(false);
                  setModalOpen(true);
                }}
                className="rounded-xl border border-black/12 bg-white px-4 py-2.5 text-[0.88rem] font-semibold text-[#0d120b]"
              >
                Change password
              </button>
            </div>
          </form>
        )}
      </section>

      <AdminFormModal
        open={modalOpen}
        title="Change password"
        onClose={() => {
          if (passwordStatus === "loading") {
            return;
          }
          setModalOpen(false);
          setPasswordStatus("idle");
        }}
        onSubmit={() => {
          void savePassword();
        }}
        submitLabel={
          passwordStatus === "loading" ? "Updating…" : "Update password"
        }
      >
        {passwordStatus === "error" ? (
          <p
            role="status"
            className="rounded-xl border border-[#e8891a]/30 bg-[rgba(249,161,55,0.12)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
          >
            Could not update password. Check your current password and try
            again.
          </p>
        ) : null}
        <div>
          <label className="block">
            <span className={adminLabelClass}>Current password</span>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`${adminFieldClass} pr-12`}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <button
                type="button"
                aria-label={
                  showCurrentPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowCurrentPassword((value) => !value)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-black/45"
              >
                {showCurrentPassword ? (
                  <EyeOffIcon className="size-5" />
                ) : (
                  <EyeIcon className="size-5" />
                )}
              </button>
            </div>
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>New password</span>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`${adminFieldClass} pr-12`}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-black/45"
              >
                {showNewPassword ? (
                  <EyeOffIcon className="size-5" />
                ) : (
                  <EyeIcon className="size-5" />
                )}
              </button>
            </div>
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Confirm password</span>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`${adminFieldClass} pr-12`}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
              <button
                type="button"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-black/45"
              >
                {showNewPassword ? (
                  <EyeOffIcon className="size-5" />
                ) : (
                  <EyeIcon className="size-5" />
                )}
              </button>
            </div>
          </label>
        </div>
      </AdminFormModal>
    </div>
  );
}
