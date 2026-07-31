"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { supportCopy } from "@/constants/dashboard";

export function SupportPage() {
  const formId = useId();
  const defaultSubject = supportCopy.subjects[0];

  if (defaultSubject === undefined) {
    throw new Error("supportCopy.subjects must include at least one subject");
  }

  const [subject, setSubject] = useState<(typeof supportCopy.subjects)[number]>(
    defaultSubject,
  );
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim() || status === "loading") {
      return;
    }

    setStatus("loading");
    await new Promise((resolve) => {
      window.setTimeout(resolve, 700);
    });
    setStatus("sent");
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          {supportCopy.title}
        </h1>
        <p className="mt-2 text-[0.95rem] font-medium text-black/50">
          {supportCopy.lede}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6"
        >
          {status === "sent" ? (
            <p
              role="status"
              className="mb-4 rounded-xl border border-brand/25 bg-[rgba(116,129,95,0.1)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
            >
              {supportCopy.success}
            </p>
          ) : null}

          <label
            htmlFor={`${formId}-subject`}
            className="block text-[0.8rem] font-bold text-[#0d120b]"
          >
            Subject
          </label>
          <select
            id={`${formId}-subject`}
            value={subject}
            onChange={(event) =>
              setSubject(
                event.target.value as (typeof supportCopy.subjects)[number],
              )
            }
            className="mt-2 w-full rounded-xl border-0 bg-[rgba(116,129,95,0.1)] px-4 py-3 text-[0.92rem] font-medium outline-none focus-visible:shadow-[0_0_0_2px_#f3f5ef,0_0_0_4px_#f9a137]"
          >
            {supportCopy.subjects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label
            htmlFor={`${formId}-message`}
            className="mt-4 block text-[0.8rem] font-bold text-[#0d120b]"
          >
            Message
          </label>
          <textarea
            id={`${formId}-message`}
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border-0 bg-[rgba(116,129,95,0.1)] px-4 py-3 text-[0.92rem] font-medium outline-none focus-visible:shadow-[0_0_0_2px_#f3f5ef,0_0_0_4px_#f9a137]"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-4 rounded-xl bg-logo-gradient px-5 py-2.5 text-[0.82rem] font-extrabold text-[#0d120b] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-70"
          >
            {status === "loading" ? supportCopy.sending : supportCopy.cta}
          </button>
        </form>

        <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6">
          <h2 className="text-[1.05rem] font-extrabold text-[#0d120b]">
            Quick answers
          </h2>
          <ul className="mt-4 divide-y divide-black/8">
            {supportCopy.faqs.map((faq, index) => {
              const open = openFaq === index;

              return (
                <li key={faq.q}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="flex w-full items-center justify-between gap-3 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    <span className="text-[0.92rem] font-bold text-[#0d120b]">
                      {faq.q}
                    </span>
                    <span aria-hidden="true" className="text-brand">
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  {open ? (
                    <p className="pb-3.5 text-[0.88rem] leading-[1.55] font-medium text-black/55">
                      {faq.a}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
