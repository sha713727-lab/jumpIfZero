"use client";

import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { forgotPasswordCopy } from "@/constants/login";
import { useModalFocus } from "@/lib/useModalFocus";

type ForgotPasswordModalProps = {
  readonly open: boolean;
  readonly initialEmail?: string;
  readonly onClose: () => void;
};

function CloseIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function ForgotPasswordModalContent({
  initialEmail,
  onClose,
}: {
  readonly initialEmail: string;
  readonly onClose: () => void;
}) {
  const titleId = useId();
  const formId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  useModalFocus({
    open: true,
    containerRef,
    initialFocusRef: emailRef,
    onClose,
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "loading") {
      return;
    }

    const next = email.trim();

    if (!next) {
      setError(forgotPasswordCopy.requiredEmail);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
      setError(forgotPasswordCopy.validationEmail);
      return;
    }

    setError(null);
    setStatus("loading");

    await new Promise((resolve) => {
      window.setTimeout(resolve, 900);
    });

    setStatus("success");
  };

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[120] flex items-center justify-center p-5"
    >
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-[#0d120b]/45"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-[24rem] rounded-2xl border border-black/10 bg-cream p-6 shadow-[0_28px_70px_rgba(13,18,11,0.28)] md:p-7"
      >
        <button
          type="button"
          aria-label={forgotPasswordCopy.close}
          onClick={onClose}
          className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-xl text-[#0d120b]/55 transition-colors hover:bg-black/[0.05] hover:text-[#0d120b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <CloseIcon className="size-5" />
        </button>

        {status === "success" ? (
          <div>
            <h2
              id={titleId}
              className="pr-10 text-[1.35rem] font-extrabold tracking-[-0.03em] text-[#0d120b]"
            >
              {forgotPasswordCopy.successTitle}
            </h2>
            <p className="mt-3 text-[0.92rem] leading-[1.55] font-medium text-black/55">
              {forgotPasswordCopy.successLede}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-logo-gradient px-6 py-3.5 text-[0.95rem] font-bold text-[#0d120b] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              {forgotPasswordCopy.done}
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit}>
            <h2
              id={titleId}
              className="pr-10 text-[1.35rem] font-extrabold tracking-[-0.03em] text-[#0d120b]"
            >
              {forgotPasswordCopy.title}
            </h2>
            <p className="mt-2 text-[0.92rem] leading-[1.55] font-medium text-black/55">
              {forgotPasswordCopy.lede}
            </p>

            <label
              htmlFor={`${formId}-email`}
              className="mt-6 mb-2 block text-[0.9rem] font-semibold text-[#0d120b]"
            >
              {forgotPasswordCopy.emailLabel}
            </label>
            <input
              ref={emailRef}
              id={`${formId}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={status === "loading"}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${formId}-error` : undefined}
              className={`w-full rounded-xl border-0 bg-[rgba(116,129,95,0.12)] px-4 py-3.5 text-[0.95rem] font-medium text-black outline-none transition-[box-shadow,background-color] duration-200 placeholder:text-black/35 focus-visible:shadow-[0_0_0_2px_#f7f5f0,0_0_0_4px_#f9a137] disabled:opacity-60 ${error ? "shadow-[0_0_0_2px_#0d120b]" : ""}`}
            />
            {error ? (
              <p
                id={`${formId}-error`}
                className="mt-2 text-[0.82rem] font-medium text-[#0d120b]"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-5 w-full rounded-xl bg-logo-gradient px-6 py-3.5 text-[0.95rem] font-bold text-[#0d120b] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading"
                ? forgotPasswordCopy.submitting
                : forgotPasswordCopy.submit}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function ForgotPasswordModal({
  open,
  initialEmail = "",
  onClose,
}: ForgotPasswordModalProps) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  return (
    <ForgotPasswordModalContent
      key={initialEmail}
      initialEmail={initialEmail}
      onClose={onClose}
    />
  );
}
