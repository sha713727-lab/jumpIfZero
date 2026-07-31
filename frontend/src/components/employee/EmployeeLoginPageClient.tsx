"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ForgotPasswordModal } from "@/components/login/ForgotPasswordModal";
import {
  employeeLoginCopy,
  type EmployeeLoginFieldErrors,
  type EmployeeLoginFormValues,
} from "@/constants/employeeAuth";
import { initialAdminDemoState } from "@/constants/adminDemo";
import { site } from "@/constants/site";
import { getGoogleDemoEmployeeId } from "@/lib/getGoogleDemoEmployeeId";
import { readEmployeeSession, writeEmployeeSession } from "@/lib/employeeSession";
import { submitEmployeeLogin } from "@/lib/submitEmployeeLogin";
import { validateEmployeeLoginForm } from "@/lib/validateEmployeeLogin";

const EMPTY_VALUES: EmployeeLoginFormValues = {
  email: "",
  password: "",
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

function GoogleIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const labelClass = "mb-2 block text-[0.9rem] font-semibold text-[#0d120b]";
const fieldClass =
  "w-full rounded-xl border-0 bg-[rgba(116,129,95,0.12)] px-4 py-3.5 text-[0.95rem] font-medium text-black outline-none transition-[box-shadow,background-color] duration-200 placeholder:text-black/35 hover:bg-[rgba(116,129,95,0.16)] focus-visible:bg-[rgba(116,129,95,0.16)] focus-visible:shadow-[0_0_0_2px_#f7f5f0,0_0_0_4px_#f9a137] disabled:cursor-not-allowed disabled:opacity-60";

export function EmployeeLoginPageClient() {
  const router = useRouter();
  const formId = useId();
  const firstErrorRef = useRef<HTMLElement | null>(null);
  const [values, setValues] = useState<EmployeeLoginFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<EmployeeLoginFieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "google" | "error">(
    "idle",
  );
  const [summary, setSummary] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    const session = readEmployeeSession();

    if (!session) {
      return;
    }

    const employee = initialAdminDemoState.employees.find(
      (item) => item.id === session.employeeId && item.active,
    );

    if (employee) {
      router.replace("/employee");
    }
  }, [router]);

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      return;
    }

    firstErrorRef.current?.focus();
  }, [errors]);

  const setField = <K extends keyof EmployeeLoginFormValues>(
    key: K,
    value: EmployeeLoginFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "loading" || status === "google") {
      return;
    }

    const nextErrors = validateEmployeeLoginForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      setSummary(employeeLoginCopy.validationSummary);
      return;
    }

    setSummary(null);
    setStatus("loading");

    const result = await submitEmployeeLogin(values);

    if (!result.ok) {
      setStatus("error");
      setSummary(
        result.reason === "credentials"
          ? employeeLoginCopy.credentialsError
          : employeeLoginCopy.serverError,
      );
      return;
    }

    writeEmployeeSession(result.employeeId);
    router.replace("/employee");
  };

  const onGoogle = async () => {
    if (status === "loading" || status === "google") {
      return;
    }

    const employeeId = getGoogleDemoEmployeeId();

    if (!employeeId) {
      setStatus("error");
      setSummary(employeeLoginCopy.serverError);
      return;
    }

    setSummary(null);
    setErrors({});
    setStatus("google");

    await new Promise((resolve) => {
      window.setTimeout(resolve, 900);
    });

    writeEmployeeSession(employeeId);
    router.replace("/employee");
  };

  const disabled = status === "loading" || status === "google";

  return (
    <main className="bg-cream text-black">
      <section
        aria-label="Employee login"
        className="flex min-h-[100svh] items-center justify-center px-5 py-16 md:px-8"
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
                {employeeLoginCopy.watermark}
              </p>
              <h1 className="relative text-[1.85rem] leading-none font-extrabold tracking-[0.08em] text-[#0d120b] uppercase">
                {employeeLoginCopy.title}
              </h1>
            </div>
            <p className="mt-3 max-w-[18rem] text-[0.88rem] leading-[1.45] font-medium text-black/45">
              {employeeLoginCopy.lede}
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
              <label htmlFor={`${formId}-email`} className={labelClass}>
                {employeeLoginCopy.emailLabel}
              </label>
              <input
                ref={(node) => {
                  if (errors.email) {
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
                className={`${fieldClass} ${errors.email ? "shadow-[0_0_0_2px_#0d120b]" : ""}`}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor={`${formId}-password`}
                  className="text-[0.9rem] font-semibold text-[#0d120b]"
                >
                  {employeeLoginCopy.passwordLabel}
                </label>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setForgotOpen(true)}
                  className="text-[0.82rem] font-semibold text-brand transition-colors hover:text-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-60"
                >
                  {employeeLoginCopy.forgot}
                </button>
              </div>
              <div className="relative">
                <input
                  ref={(node) => {
                    if (!errors.email && errors.password) {
                      firstErrorRef.current = node;
                    }
                  }}
                  id={`${formId}-password`}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={disabled}
                  value={values.password}
                  onChange={(event) => setField("password", event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  className={`${fieldClass} pr-12 ${errors.password ? "shadow-[0_0_0_2px_#0d120b]" : ""}`}
                />
                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? employeeLoginCopy.hidePassword
                      : employeeLoginCopy.showPassword
                  }
                  disabled={disabled}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-black/45"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={disabled}
              className="w-full rounded-xl bg-brand px-4 py-3.5 text-[0.92rem] font-extrabold tracking-[0.04em] text-cream uppercase transition-colors hover:bg-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-60"
            >
              {status === "loading"
                ? employeeLoginCopy.submitting
                : employeeLoginCopy.submit}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-black/10" />
            <span className="text-[0.78rem] font-semibold tracking-[0.12em] text-black/35 uppercase">
              {employeeLoginCopy.orDivider}
            </span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={onGoogle}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-black/12 bg-white px-4 py-3.5 text-[0.9rem] font-semibold text-[#0d120b] transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-60"
          >
            <GoogleIcon className="size-5" />
            {status === "google"
              ? employeeLoginCopy.googleSubmitting
              : employeeLoginCopy.google}
          </button>
        </div>
      </section>

      <ForgotPasswordModal
        open={forgotOpen}
        initialEmail={values.email}
        onClose={() => setForgotOpen(false)}
      />
    </main>
  );
}
