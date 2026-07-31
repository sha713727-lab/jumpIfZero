"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { demoCustomer } from "@/constants/demoCustomer";
import {
  registerCopy,
  type RegisterFieldErrors,
  type RegisterFormValues,
} from "@/constants/register";
import { site } from "@/constants/site";
import { readDemoSession, writeDemoSession } from "@/lib/demoSession";
import { applyHeaderTone } from "@/lib/headerTone";
import { submitRegister } from "@/lib/submitRegister";
import { validateRegisterForm } from "@/lib/validateRegister";

const HEADER_HEIGHT = 72;
const PAGE_BG = "#f7f5f0";

const EMPTY_VALUES: RegisterFormValues = {
  name: "",
  email: "",
  company: "",
  password: "",
  confirmPassword: "",
};

function ErrorIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 5v3.5" />
      <path d="M8 11h.01" />
    </svg>
  );
}

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

const labelClass = "mb-2 block text-[0.9rem] font-semibold text-[#0d120b]";

const fieldClass =
  "w-full rounded-xl border-0 bg-[rgba(116,129,95,0.12)] px-4 py-3.5 text-[0.95rem] font-medium text-black outline-none transition-[box-shadow,background-color] duration-200 placeholder:text-black/35 hover:bg-[rgba(116,129,95,0.16)] focus-visible:bg-[rgba(116,129,95,0.16)] focus-visible:shadow-[0_0_0_2px_#f7f5f0,0_0_0_4px_#f9a137] disabled:cursor-not-allowed disabled:opacity-60";

export function RegisterPageClient() {
  const router = useRouter();
  const formId = useId();
  const sectionRef = useRef<HTMLElement | null>(null);
  const firstErrorRef = useRef<HTMLElement | null>(null);
  const [values, setValues] = useState<RegisterFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<RegisterFieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const [summary, setSummary] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const session = readDemoSession();

    if (session?.customerId === demoCustomer.id) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    applyHeaderTone(true, PAGE_BG);

    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const sync = () => {
      const rect = section.getBoundingClientRect();

      if (rect.top > HEADER_HEIGHT || rect.bottom <= HEADER_HEIGHT) {
        return;
      }

      applyHeaderTone(true, PAGE_BG);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      return;
    }

    firstErrorRef.current?.focus();
  }, [errors]);

  const setField = <K extends keyof RegisterFormValues>(
    key: K,
    value: RegisterFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const finish = () => {
    writeDemoSession(demoCustomer.id);
    router.replace("/dashboard");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "loading") {
      return;
    }

    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      setSummary(registerCopy.validationSummary);
      return;
    }

    setSummary(null);
    setStatus("loading");

    const result = await submitRegister(values);

    if (!result.ok) {
      setStatus("error");
      setSummary(registerCopy.serverError);
      return;
    }

    finish();
  };

  const disabled = status === "loading";

  const focusOrder: (keyof RegisterFieldErrors)[] = [
    "name",
    "email",
    "company",
    "password",
    "confirmPassword",
  ];

  const firstErrorKey = focusOrder.find((key) => Boolean(errors[key]));

  return (
    <main className="bg-cream text-black">
      <section
        ref={sectionRef}
        aria-label="Register"
        data-header-tone="light"
        data-header-bg={PAGE_BG}
        className="flex min-h-[100svh] items-center justify-center px-5 py-28 md:px-8"
      >
        <div className="w-full max-w-[22rem]">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/jumpIfZeroLogo.png"
                alt=""
                width={108}
                height={105}
                className="h-24 w-auto"
                priority
              />
              <p className="text-[1.15rem] font-semibold tracking-[-0.01em] text-[#0d120b]">
                {site.name}
              </p>
            </div>

            <div className="relative mt-10 flex items-center justify-center">
              <p
                aria-hidden="true"
                className="pointer-events-none absolute select-none whitespace-nowrap text-[clamp(2.2rem,9vw,4rem)] leading-none font-extrabold tracking-[0.02em] text-black/[0.06]"
              >
                {registerCopy.watermark}
              </p>
              <h1 className="relative text-[1.85rem] leading-none font-extrabold tracking-[0.08em] text-[#0d120b] uppercase">
                {registerCopy.title}
              </h1>
            </div>
            <p className="mt-3 max-w-[19rem] text-[0.88rem] leading-[1.45] font-medium text-black/45">
              {registerCopy.lede}
            </p>
          </div>

          <form
            noValidate
            onSubmit={onSubmit}
            className="mt-9 space-y-4"
            aria-describedby={summary ? `${formId}-summary` : undefined}
          >
            {summary ? (
              <p
                id={`${formId}-summary`}
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-2 text-[0.88rem] font-medium leading-[1.45] text-[#0d120b]"
              >
                <ErrorIcon className="mt-0.5 size-4 shrink-0" />
                <span>{summary}</span>
              </p>
            ) : null}

            {(
              [
                ["name", registerCopy.nameLabel, "text", "name"],
                ["email", registerCopy.emailLabel, "email", "email"],
                ["company", registerCopy.companyLabel, "text", "organization"],
              ] as const
            ).map(([key, label, type, autoComplete]) => (
              <div key={key}>
                <label htmlFor={`${formId}-${key}`} className={labelClass}>
                  {label}
                </label>
                <input
                  ref={(node) => {
                    if (firstErrorKey === key) {
                      firstErrorRef.current = node;
                    }
                  }}
                  id={`${formId}-${key}`}
                  name={key}
                  type={type}
                  autoComplete={autoComplete}
                  required
                  disabled={disabled}
                  value={values[key]}
                  onChange={(event) => setField(key, event.target.value)}
                  aria-invalid={Boolean(errors[key])}
                  aria-describedby={
                    errors[key] ? `${formId}-${key}-error` : undefined
                  }
                  className={`${fieldClass} ${errors[key] ? "shadow-[0_0_0_2px_#0d120b]" : ""}`}
                />
                {errors[key] ? (
                  <p
                    id={`${formId}-${key}-error`}
                    className="mt-2 flex items-start gap-2 text-[0.82rem] font-medium text-[#0d120b]"
                  >
                    <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
                    <span>{errors[key]}</span>
                  </p>
                ) : null}
              </div>
            ))}

            <div>
              <label htmlFor={`${formId}-password`} className={labelClass}>
                {registerCopy.passwordLabel}
              </label>
              <div className="relative">
                <input
                  ref={(node) => {
                    if (firstErrorKey === "password") {
                      firstErrorRef.current = node;
                    }
                  }}
                  id={`${formId}-password`}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  disabled={disabled}
                  value={values.password}
                  onChange={(event) => setField("password", event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? `${formId}-password-error` : undefined
                  }
                  className={`${fieldClass} pr-12 ${errors.password ? "shadow-[0_0_0_2px_#0d120b]" : ""}`}
                />
                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? registerCopy.hidePassword
                      : registerCopy.showPassword
                  }
                  disabled={disabled}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-black/40 transition-colors hover:text-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p
                  id={`${formId}-password-error`}
                  className="mt-2 flex items-start gap-2 text-[0.82rem] font-medium text-[#0d120b]"
                >
                  <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${formId}-confirm`} className={labelClass}>
                {registerCopy.confirmLabel}
              </label>
              <div className="relative">
                <input
                  ref={(node) => {
                    if (firstErrorKey === "confirmPassword") {
                      firstErrorRef.current = node;
                    }
                  }}
                  id={`${formId}-confirm`}
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  disabled={disabled}
                  value={values.confirmPassword}
                  onChange={(event) =>
                    setField("confirmPassword", event.target.value)
                  }
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? `${formId}-confirm-error`
                      : undefined
                  }
                  className={`${fieldClass} pr-12 ${errors.confirmPassword ? "shadow-[0_0_0_2px_#0d120b]" : ""}`}
                />
                <button
                  type="button"
                  aria-label={
                    showConfirm
                      ? registerCopy.hidePassword
                      : registerCopy.showPassword
                  }
                  disabled={disabled}
                  onClick={() => setShowConfirm((value) => !value)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-black/40 transition-colors hover:text-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  {showConfirm ? (
                    <EyeOffIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p
                  id={`${formId}-confirm-error`}
                  className="mt-2 flex items-start gap-2 text-[0.82rem] font-medium text-[#0d120b]"
                >
                  <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={disabled}
              className="w-full rounded-xl bg-logo-gradient px-6 py-3.5 text-[0.95rem] font-bold text-[#0d120b] transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading"
                ? registerCopy.submitting
                : registerCopy.submit}
            </button>

            <p className="text-center text-[0.84rem] leading-[1.45] font-medium text-black/50">
              {registerCopy.loginPrompt}{" "}
              <Link
                href={registerCopy.loginHref}
                className="font-extrabold text-brand transition-colors hover:text-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                {registerCopy.loginLink}
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
