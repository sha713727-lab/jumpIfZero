"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  budgetBands,
  contactCopy,
  contactDetails,
  projectTypes,
} from "@/constants/contact";
import type { ContactFieldErrors, ContactFormValues } from "@/constants/contact";
import { submitContact } from "@/lib/submitContact";
import { validateContactForm } from "@/lib/validateContact";

const EMPTY_VALUES: ContactFormValues = {
  name: "",
  email: "",
  company: "",
  projectType: "",
  budget: "",
  message: "",
  website: "",
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

const labelClass =
  "mb-2.5 block text-[0.66rem] font-extrabold tracking-[0.22em] text-[#2f3a28]/70 uppercase transition-colors group-focus-within:text-brand";

const fieldClass =
  "w-full rounded-[1rem] border bg-white/90 px-4 py-3.5 text-[0.95rem] font-medium text-black outline-none transition-[border-color,box-shadow,background-color,transform] duration-300 placeholder:text-black/35 hover:border-brand/40 hover:bg-white hover:shadow-[0_10px_28px_rgba(116,129,95,0.12)] focus-visible:border-transparent focus-visible:bg-white focus-visible:shadow-[0_0_0_2px_#f7f5f0,0_0_0_4px_#f9a137] disabled:cursor-not-allowed disabled:opacity-60";

const selectClass = `${fieldClass} appearance-none bg-[length:0.9rem] bg-[right_1rem_center] bg-no-repeat pr-11`;

const selectChevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2374815f' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.8' d='m5 7.5 5 5 5-5'/%3E%3C/svg%3E\")";

function fieldBorder(hasError: boolean): string {
  return hasError
    ? "border-2 border-black shadow-none hover:border-black hover:shadow-none focus-visible:shadow-none"
    : "border border-black/10";
}

export function ContactForm() {
  const formId = useId();
  const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [summary, setSummary] = useState<string | null>(null);
  const firstErrorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      return;
    }

    firstErrorRef.current?.focus();
  }, [errors]);

  const setField = <K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "loading") {
      return;
    }

    const nextErrors = validateContactForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      setSummary(contactCopy.validationSummary);
      return;
    }

    setSummary(null);
    setStatus("loading");

    const result = await submitContact(values);

    if (!result.ok) {
      if (result.reason === "honeypot") {
        setStatus("success");
        return;
      }

      setStatus("error");
      setSummary(contactCopy.serverError);
      return;
    }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-[1.75rem] border border-black/10 bg-white px-6 py-10 shadow-[0_18px_40px_rgba(47,58,40,0.08)] md:px-8"
      >
        <p className="text-[clamp(1rem,2vw,1.2rem)] font-extrabold tracking-[-0.02em] text-black">
          {contactCopy.success}
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY_VALUES);
            setErrors({});
            setSummary(null);
            setStatus("idle");
          }}
          className="mt-8 inline-flex items-center rounded-full bg-logo-gradient px-9 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-black uppercase transition-colors duration-300 hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
        >
          {contactCopy.sendAnother}
        </button>
      </div>
    );
  }

  const disabled = status === "loading";

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="relative space-y-6"
      aria-describedby={summary ? `${formId}-summary` : undefined}
    >
      {summary ? (
        <p
          id={`${formId}-summary`}
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 rounded-[1rem] border border-black/10 bg-white px-4 py-3 text-[0.9rem] font-medium leading-[1.55] text-black"
        >
          <ErrorIcon className="mt-0.5 size-4 shrink-0" />
          <span>{summary}</span>
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="group">
          <label htmlFor={`${formId}-name`} className={labelClass}>
            Name <span className="text-logo-gradient">*</span>
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
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
            placeholder="Your full name"
            className={`${fieldClass} ${fieldBorder(Boolean(errors.name))}`}
          />
          {errors.name ? (
            <p
              id={`${formId}-name-error`}
              className="mt-2 flex items-start gap-2 text-[0.85rem] font-medium text-black"
            >
              <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
              <span>{errors.name}</span>
            </p>
          ) : null}
        </div>

        <div className="group">
          <label htmlFor={`${formId}-email`} className={labelClass}>
            Email <span className="text-logo-gradient">*</span>
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
            aria-describedby={errors.email ? `${formId}-email-error` : undefined}
            placeholder="you@company.com"
            className={`${fieldClass} ${fieldBorder(Boolean(errors.email))}`}
          />
          {errors.email ? (
            <p
              id={`${formId}-email-error`}
              className="mt-2 flex items-start gap-2 text-[0.85rem] font-medium text-black"
            >
              <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
              <span>{errors.email}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="group">
        <label htmlFor={`${formId}-company`} className={labelClass}>
          Company
        </label>
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
          placeholder="Company or studio"
          className={`${fieldClass} ${fieldBorder(Boolean(errors.company))}`}
        />
        {errors.company ? (
          <p
            id={`${formId}-company-error`}
            className="mt-2 flex items-start gap-2 text-[0.85rem] font-medium text-black"
          >
            <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
            <span>{errors.company}</span>
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="group">
          <label htmlFor={`${formId}-project`} className={labelClass}>
            Project type <span className="text-logo-gradient">*</span>
          </label>
          <select
            ref={(node) => {
              if (
                !errors.name &&
                !errors.email &&
                !errors.company &&
                errors.projectType
              ) {
                firstErrorRef.current = node;
              }
            }}
            id={`${formId}-project`}
            name="projectType"
            required
            disabled={disabled}
            value={values.projectType}
            onChange={(event) =>
              setField(
                "projectType",
                event.target.value as ContactFormValues["projectType"],
              )
            }
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={
              errors.projectType ? `${formId}-project-error` : undefined
            }
            className={`${selectClass} ${fieldBorder(Boolean(errors.projectType))}`}
            style={{ backgroundImage: selectChevron }}
          >
            <option value="">Select…</option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.projectType ? (
            <p
              id={`${formId}-project-error`}
              className="mt-2 flex items-start gap-2 text-[0.85rem] font-medium text-black"
            >
              <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
              <span>{errors.projectType}</span>
            </p>
          ) : null}
        </div>

        <div className="group">
          <label htmlFor={`${formId}-budget`} className={labelClass}>
            Budget{" "}
            <span className="tracking-[0.12em] text-black/40 normal-case">
              ({contactCopy.currencyHint})
            </span>
          </label>
          <select
            ref={(node) => {
              if (
                !errors.name &&
                !errors.email &&
                !errors.company &&
                !errors.projectType &&
                errors.budget
              ) {
                firstErrorRef.current = node;
              }
            }}
            id={`${formId}-budget`}
            name="budget"
            disabled={disabled}
            value={values.budget}
            onChange={(event) =>
              setField(
                "budget",
                event.target.value as ContactFormValues["budget"],
              )
            }
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={
              errors.budget ? `${formId}-budget-error` : undefined
            }
            className={`${selectClass} ${fieldBorder(Boolean(errors.budget))}`}
            style={{ backgroundImage: selectChevron }}
          >
            <option value="">Select…</option>
            {budgetBands.map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </select>
          {errors.budget ? (
            <p
              id={`${formId}-budget-error`}
              className="mt-2 flex items-start gap-2 text-[0.85rem] font-medium text-black"
            >
              <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
              <span>{errors.budget}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="group">
        <label htmlFor={`${formId}-message`} className={labelClass}>
          Message <span className="text-logo-gradient">*</span>
        </label>
        <textarea
          ref={(node) => {
            if (
              !errors.name &&
              !errors.email &&
              !errors.company &&
              !errors.projectType &&
              !errors.budget &&
              errors.message
            ) {
              firstErrorRef.current = node;
            }
          }}
          id={`${formId}-message`}
          name="message"
          required
          rows={6}
          disabled={disabled}
          value={values.message}
          onChange={(event) => setField("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? `${formId}-message-error` : undefined
          }
          placeholder="Goals, timeline, and what “done” looks like."
          className={`${fieldClass} min-h-[9.5rem] resize-y ${fieldBorder(Boolean(errors.message))}`}
        />
        {errors.message ? (
          <p
            id={`${formId}-message-error`}
            className="mt-2 flex items-start gap-2 text-[0.85rem] font-medium text-black"
          >
            <ErrorIcon className="mt-0.5 size-3.5 shrink-0" />
            <span>{errors.message}</span>
          </p>
        ) : null}
      </div>

      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor={`${formId}-website`}>Website</label>
        <input
          id={`${formId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => setField("website", event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex w-fit items-center gap-3 rounded-full bg-logo-gradient px-9 py-4 text-[0.7rem] font-extrabold tracking-[0.22em] text-black uppercase transition-colors duration-300 hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          {disabled ? contactCopy.submitting : contactCopy.submit}
          {!disabled ? <span aria-hidden="true">→</span> : null}
        </button>
        <p className="max-w-sm text-[0.85rem] font-medium leading-[1.55] text-black/50">
          {contactCopy.privacy}
        </p>
      </div>
    </form>
  );
}

export function ContactAside() {
  return (
    <aside className="space-y-10 rounded-[1.75rem] border border-black/8 bg-white/70 p-6 shadow-[0_18px_40px_rgba(47,58,40,0.06)] md:p-8">
      <div>
        <h2 className="text-[clamp(1rem,2vw,1.2rem)] font-extrabold tracking-[-0.02em] text-black">
          {contactCopy.includeTitle}
        </h2>
        <ul className="mt-5 space-y-3.5 text-[0.95rem] font-medium leading-[1.6] text-black/55">
          {contactCopy.includeItems.map((item) => (
            <li key={item} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-logo-gradient"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-black/8 pt-8">
        <h2 className="text-[clamp(1rem,2vw,1.2rem)] font-extrabold tracking-[-0.02em] text-black">
          {contactCopy.directTitle}
        </h2>
        <p className="mt-3 text-[0.66rem] font-extrabold tracking-[0.22em] text-black/40 uppercase">
          {contactCopy.emailLabel}
        </p>
        <a
          href={`mailto:${contactDetails.email}`}
          className="mt-2 inline-block text-[0.95rem] font-extrabold tracking-[-0.02em] text-brand underline-offset-4 transition-colors hover:text-logo-gradient hover:underline focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
        >
          {contactDetails.email}
        </a>
      </div>
    </aside>
  );
}
