"use client";

import { contactCopy, contactDetails } from "@/constants/contact";

export function ContactDirect() {
  return (
    <div className="space-y-5 rounded-[1.75rem] border border-black/8 bg-white/70 p-6 shadow-[0_18px_40px_rgba(47,58,40,0.06)] md:p-8">
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
          href={`mailto:${contactDetails.email}`}
          className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3.5 text-[0.9rem] font-extrabold tracking-[-0.01em] text-cream transition-colors hover:bg-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          {contactCopy.emailCta}
        </a>
        <a
          href={contactDetails.phoneHref}
          className="inline-flex items-center justify-center rounded-xl border border-black/12 bg-white px-5 py-3.5 text-[0.9rem] font-extrabold tracking-[-0.01em] text-[#0d120b] transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          {contactCopy.phoneCta}
        </a>
      </div>

      <div className="space-y-4 border-t border-black/8 pt-6">
        <div>
          <p className="text-[0.66rem] font-extrabold tracking-[0.22em] text-black/40 uppercase">
            {contactCopy.emailLabel}
          </p>
          <a
            href={`mailto:${contactDetails.email}`}
            className="mt-2 inline-block text-[0.95rem] font-extrabold tracking-[-0.02em] text-brand underline-offset-4 transition-colors hover:text-logo-gradient hover:underline focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
          >
            {contactDetails.email}
          </a>
        </div>
        <div>
          <p className="text-[0.66rem] font-extrabold tracking-[0.22em] text-black/40 uppercase">
            {contactCopy.phoneLabel}
          </p>
          <a
            href={contactDetails.phoneHref}
            className="mt-2 inline-block text-[0.95rem] font-extrabold tracking-[-0.02em] text-brand underline-offset-4 transition-colors hover:text-logo-gradient hover:underline focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
          >
            {contactDetails.phone}
          </a>
        </div>
      </div>
    </div>
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
    </aside>
  );
}
