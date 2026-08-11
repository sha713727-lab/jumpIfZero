"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { adminFieldClass, adminLabelClass } from "@/components/admin/adminFormStyles";
import { resetPasswordCopy } from "@/constants/login";
import { site } from "@/constants/site";
import { applyHeaderTone } from "@/lib/headerTone";
import { submitResetPassword } from "@/lib/submitResetPassword";

const HEADER_HEIGHT = 72;
const PAGE_BG = "#f7f5f0";

const labelClass = adminLabelClass;
const fieldClass = `${adminFieldClass} py-3.5 disabled:cursor-not-allowed disabled:opacity-60`;

function EyeIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a18.3 18.3 0 0 1-3.2 4.3" />
      <path d="M6.1 6.1A18.4 18.4 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.4-1" />
    </svg>
  );
}

export function ResetPasswordPageClient({
  resetToken,
}: {
  readonly resetToken: string;
}) {
  const formId = useId();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [summary, setSummary] = useState<string | null>(
    resetToken.length > 0 ? null : resetPasswordCopy.missingToken,
  );

  useEffect(() => {
    applyHeaderTone(true, PAGE_BG);
    const section = sectionRef.current;
    if (!section) {
      return;
    }
    section.style.setProperty("--header-offset", `${HEADER_HEIGHT}px`);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (resetToken.length === 0) {
      setStatus("error");
      setSummary(resetPasswordCopy.missingToken);
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setSummary(resetPasswordCopy.validationPassword);
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setSummary(resetPasswordCopy.validationConfirm);
      return;
    }

    setStatus("loading");
    setSummary(null);
    const result = await submitResetPassword({
      resetToken,
      newPassword: password,
    });
    if (!result.ok) {
      setStatus("error");
      setSummary(
        result.reason === "unauthorized"
          ? resetPasswordCopy.unauthorized
          : result.reason === "validation"
            ? resetPasswordCopy.validationPassword
            : resetPasswordCopy.serverError,
      );
      return;
    }
    setStatus("success");
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] overflow-hidden px-5 pt-[calc(var(--header-offset,72px)+2.5rem)] pb-16 md:px-8"
      style={{ backgroundColor: PAGE_BG }}
    >
      <div className="relative mx-auto w-full max-w-[440px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/images/jumpIfZeroLogo.png"
            alt={site.name}
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            priority
          />
          <p className="mt-4 text-[0.72rem] font-extrabold tracking-[0.22em] text-black/45 uppercase">
            {resetPasswordCopy.watermark}
          </p>
          <h1 className="mt-3 text-[clamp(1.55rem,3.4vw,2rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black">
            {status === "success"
              ? resetPasswordCopy.successTitle
              : resetPasswordCopy.title}
          </h1>
          <p className="mt-3 max-w-sm text-[0.95rem] leading-[1.55] font-medium text-black/55">
            {status === "success"
              ? resetPasswordCopy.successLede
              : resetPasswordCopy.lede}
          </p>
        </div>

        {status === "success" ? (
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-full bg-brand px-6 py-3.5 text-[0.9rem] font-extrabold tracking-[0.04em] text-cream uppercase"
          >
            {resetPasswordCopy.successCta}
          </Link>
        ) : (
          <form id={formId} onSubmit={onSubmit} className="space-y-5" noValidate>
            {summary ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-medium text-red-800"
              >
                {summary}
              </p>
            ) : null}

            <div>
              <label htmlFor={`${formId}-password`} className={labelClass}>
                {resetPasswordCopy.passwordLabel}
              </label>
              <div className="relative mt-2">
                <input
                  id={`${formId}-password`}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  disabled={status === "loading" || resetToken.length === 0}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${fieldClass} pr-12`}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-black/45"
                  aria-label={
                    showPassword
                      ? resetPasswordCopy.hidePassword
                      : resetPasswordCopy.showPassword
                  }
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor={`${formId}-confirm`} className={labelClass}>
                {resetPasswordCopy.confirmPasswordLabel}
              </label>
              <input
                id={`${formId}-confirm`}
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                disabled={status === "loading" || resetToken.length === 0}
                onChange={(event) => setConfirm(event.target.value)}
                className={`${fieldClass} mt-2`}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading" || resetToken.length === 0}
              className="inline-flex w-full items-center justify-center rounded-full bg-brand px-6 py-3.5 text-[0.9rem] font-extrabold tracking-[0.04em] text-cream uppercase disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading"
                ? resetPasswordCopy.submitting
                : resetPasswordCopy.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
