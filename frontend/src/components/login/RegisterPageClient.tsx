"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { adminFieldClass, adminLabelClass } from "@/components/admin/adminFormStyles";
import {
  registerCopy,
  type RegisterFieldErrors,
  type RegisterFormValues,
} from "@/constants/login";
import { site } from "@/constants/site";
import { applyHeaderTone } from "@/lib/headerTone";
import { submitLogin } from "@/lib/submitLogin";
import { submitRegister } from "@/lib/submitRegister";

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

const labelClass = adminLabelClass;
const fieldClass = `${adminFieldClass} py-3.5 disabled:cursor-not-allowed disabled:opacity-60`;

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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") {
      return;
    }

    setSummary(null);
    setStatus("loading");
    setErrors({});

    try {
      const result = await submitRegister(values);
      if (!result.ok) {
        if ("fieldErrors" in result) {
          setErrors(result.fieldErrors);
          setStatus("idle");
          setSummary(registerCopy.validationSummary);
          return;
        }
        setStatus("error");
        setSummary(
          result.reason === "conflict"
            ? registerCopy.conflictError
            : registerCopy.serverError,
        );
        return;
      }

      const loginResult = await submitLogin({
        email: values.email,
        password: values.password,
      });
      if (!loginResult.ok) {
        router.replace("/login");
        router.refresh();
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setStatus("error");
      setSummary(registerCopy.serverError);
    }
  };

  const disabled = status === "loading";

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
                aria-hidden="true"
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
            <p className="mt-3 max-w-[18rem] text-[0.88rem] leading-[1.45] font-medium text-black/45">
              {registerCopy.lede}
            </p>
          </div>

          <form
            noValidate
            onSubmit={onSubmit}
            className="mt-9 space-y-5"
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

            <div>
              <label htmlFor={`${formId}-name`} className={labelClass}>
                {registerCopy.nameLabel}
              </label>
              <input
                ref={(node) => {
                  if (errors.name) {
                    firstErrorRef.current = node;
                  }
                }}
                id={`${formId}-name`}
                name="name"
                type="text"
                autoComplete="name"
                required
                disabled={disabled}
                value={values.name}
                onChange={(event) => setField("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? `${formId}-name-error` : undefined
                }
                className={`${fieldClass} ${errors.name ? "shadow-[0_0_0_2px_#0d120b]" : ""}`}
              />
              {errors.name ? (
                <p
                  id={`${formId}-name-error`}
                  className="mt-2 flex items-start gap-2 text-[0.82rem] font-medium text-[#0d120b]"
                >
                  <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${formId}-email`} className={labelClass}>
                {registerCopy.emailLabel}
              </label>
              <input
                ref={(node) => {
                  if (!errors.name && errors.email) {
                    firstErrorRef.current = node;
                  }
                }}
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={disabled}
                value={values.email}
                onChange={(event) => setField("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? `${formId}-email-error` : undefined
                }
                className={`${fieldClass} ${errors.email ? "shadow-[0_0_0_2px_#0d120b]" : ""}`}
              />
              {errors.email ? (
                <p
                  id={`${formId}-email-error`}
                  className="mt-2 flex items-start gap-2 text-[0.82rem] font-medium text-[#0d120b]"
                >
                  <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              ) : null}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor={`${formId}-company`}
                  className="text-[0.88rem] font-bold text-[#0d120b]"
                >
                  {registerCopy.companyLabel}
                </label>
                <span className="text-[0.82rem] font-medium text-black/40">
                  {registerCopy.companyHint}
                </span>
              </div>
              <input
                ref={(node) => {
                  if (!errors.name && !errors.email && errors.company) {
                    firstErrorRef.current = node;
                  }
                }}
                id={`${formId}-company`}
                name="company"
                type="text"
                autoComplete="organization"
                disabled={disabled}
                value={values.company}
                onChange={(event) => setField("company", event.target.value)}
                aria-invalid={Boolean(errors.company)}
                aria-describedby={
                  errors.company ? `${formId}-company-error` : undefined
                }
                className={`${fieldClass} ${errors.company ? "shadow-[0_0_0_2px_#0d120b]" : ""}`}
              />
              {errors.company ? (
                <p
                  id={`${formId}-company-error`}
                  className="mt-2 flex items-start gap-2 text-[0.82rem] font-medium text-[#0d120b]"
                >
                  <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{errors.company}</span>
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${formId}-password`} className={labelClass}>
                {registerCopy.passwordLabel}
              </label>
              <div className="relative">
                <input
                  ref={(node) => {
                    if (
                      !errors.name &&
                      !errors.email &&
                      !errors.company &&
                      errors.password
                    ) {
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
              <label
                htmlFor={`${formId}-confirmPassword`}
                className={labelClass}
              >
                {registerCopy.confirmPasswordLabel}
              </label>
              <input
                ref={(node) => {
                  if (
                    !errors.name &&
                    !errors.email &&
                    !errors.company &&
                    !errors.password &&
                    errors.confirmPassword
                  ) {
                    firstErrorRef.current = node;
                  }
                }}
                id={`${formId}-confirmPassword`}
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
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
                    ? `${formId}-confirmPassword-error`
                    : undefined
                }
                className={`${fieldClass} ${errors.confirmPassword ? "shadow-[0_0_0_2px_#0d120b]" : ""}`}
              />
              {errors.confirmPassword ? (
                <p
                  id={`${formId}-confirmPassword-error`}
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

            <p className="pt-1 text-center text-[0.84rem] text-black/55">
              {registerCopy.haveAccount}{" "}
              <Link
                href="/login"
                className="font-semibold text-brand transition-colors hover:text-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                {registerCopy.signIn}
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
