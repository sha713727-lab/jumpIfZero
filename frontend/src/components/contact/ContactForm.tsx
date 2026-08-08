"use client";

import { useId, useState, useTransition } from "react";
import { contactCopy } from "@/constants/contact";
import type { SiteContactDetails } from "@/lib/data/siteContact";
import {
  submitCallbackRequestAction,
  submitContactMessageAction,
} from "@/lib/submitPublicContact";

const cardClass =
  "space-y-5 rounded-[1.75rem] border border-black/8 bg-white/70 p-6 shadow-[0_18px_40px_rgba(47,58,40,0.06)] md:p-8";

const labelClass =
  "block text-[0.66rem] font-extrabold tracking-[0.18em] text-black/40 uppercase";

const fieldClass =
  "mt-2 w-full rounded-xl border border-black/8 bg-white px-4 py-3 text-[0.92rem] font-medium text-[#0d120b] outline-none transition-colors focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-secondary";

const submitClass =
  "inline-flex w-full items-center justify-center rounded-xl bg-brand px-5 py-3.5 text-[0.9rem] font-extrabold tracking-[-0.01em] text-cream transition-colors hover:bg-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-50";

function FormFeedback({
  success,
  error,
}: {
  readonly success: boolean;
  readonly error: string | null;
}) {
  if (success) {
    return (
      <p
        role="status"
        className="rounded-xl border border-brand/25 bg-[rgba(92, 104, 73,0.1)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
      >
        {contactCopy.formSuccess}
      </p>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700"
      >
        {error}
      </p>
    );
  }

  return null;
}

export function ContactDirect({
  details,
}: Readonly<{ details: SiteContactDetails }>) {
  return (
    <div className={cardClass}>
      <div>
        <h2 className="text-[clamp(1rem,2vw,1.2rem)] font-extrabold tracking-[-0.02em] text-black">
          {contactCopy.directTitle}
        </h2>
        <p className="mt-3 text-[0.95rem] font-medium leading-[1.55] text-black/55">
          {contactCopy.privacy}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={`mailto:${details.email}`}
          className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3.5 text-[0.9rem] font-extrabold tracking-[-0.01em] text-cream transition-colors hover:bg-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          {contactCopy.emailCta}
        </a>
        <a
          href={details.phoneHref}
          className="inline-flex items-center justify-center rounded-xl border border-black/12 bg-white px-5 py-3.5 text-[0.9rem] font-extrabold tracking-[-0.01em] text-[#0d120b] transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          {contactCopy.phoneCta}
        </a>
      </div>

      <div className="space-y-4 border-t border-black/8 pt-6">
        <div>
          <p className={labelClass}>{contactCopy.emailLabel}</p>
          <a
            href={`mailto:${details.email}`}
            className="mt-2 inline-block text-[0.95rem] font-extrabold tracking-[-0.02em] text-brand underline-offset-4 transition-colors hover:text-logo-gradient hover:underline focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
          >
            {details.email}
          </a>
        </div>
        <div>
          <p className={labelClass}>{contactCopy.phoneLabel}</p>
          <a
            href={details.phoneHref}
            className="mt-2 inline-block text-[0.95rem] font-extrabold tracking-[-0.02em] text-brand underline-offset-4 transition-colors hover:text-logo-gradient hover:underline focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
          >
            {details.phone}
          </a>
        </div>
      </div>
    </div>
  );
}

export function ContactMessageForm() {
  const formId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      setError(null);
      setSuccess(false);

      const result = await submitContactMessageAction({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        body: body.trim(),
      });

      if (!result.ok) {
        setError(
          result.reason === "validation"
            ? contactCopy.formValidationError
            : contactCopy.formError,
        );
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setBody("");
    });
  };

  return (
    <div className={cardClass}>
      <h2 className="text-[clamp(1rem,2vw,1.2rem)] font-extrabold tracking-[-0.02em] text-black">
        {contactCopy.messageTitle}
      </h2>

      <FormFeedback success={success} error={error} />

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label htmlFor={`${formId}-name`} className={labelClass}>
            Name
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-email`} className={labelClass}>
            Email
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-subject`} className={labelClass}>
            Subject
          </label>
          <input
            id={`${formId}-subject`}
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-body`} className={labelClass}>
            Message
          </label>
          <textarea
            id={`${formId}-body`}
            required
            rows={5}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className={`${fieldClass} min-h-[8rem] resize-y`}
          />
        </div>
        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? "Sending…" : contactCopy.messageSubmit}
        </button>
      </form>
    </div>
  );
}

export function CallbackRequestForm() {
  const formId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      setError(null);
      setSuccess(false);

      const result = await submitCallbackRequestAction({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        note: note.trim(),
      });

      if (!result.ok) {
        setError(
          result.reason === "validation"
            ? contactCopy.formValidationError
            : contactCopy.formError,
        );
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setNote("");
    });
  };

  return (
    <div className={cardClass}>
      <h2 className="text-[clamp(1rem,2vw,1.2rem)] font-extrabold tracking-[-0.02em] text-black">
        {contactCopy.callbackTitle}
      </h2>

      <FormFeedback success={success} error={error} />

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label htmlFor={`${formId}-name`} className={labelClass}>
            Name
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-email`} className={labelClass}>
            Email
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-phone`} className={labelClass}>
            Phone
          </label>
          <input
            id={`${formId}-phone`}
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-note`} className={labelClass}>
            Note
          </label>
          <textarea
            id={`${formId}-note`}
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={`${fieldClass} min-h-[6rem] resize-y`}
          />
        </div>
        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? "Sending…" : contactCopy.callbackSubmit}
        </button>
      </form>
    </div>
  );
}

export function ContactAside() {
  return (
    <aside className={cardClass}>
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
    </aside>
  );
}
