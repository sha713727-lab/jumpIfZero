"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { demoCustomer } from "@/constants/demoCustomer";
import { profileCopy } from "@/constants/dashboard";

type ProfileValues = {
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  location: string;
};

export function ProfilePage() {
  const formId = useId();
  const [values, setValues] = useState<ProfileValues>({
    name: demoCustomer.name,
    email: demoCustomer.email,
    company: demoCustomer.company,
    role: demoCustomer.role,
    phone: demoCustomer.phone,
    location: demoCustomer.location,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "saved">("idle");

  const setField = <K extends keyof ProfileValues>(
    key: K,
    value: ProfileValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "loading") {
      return;
    }

    setStatus("loading");
    await new Promise((resolve) => {
      window.setTimeout(resolve, 700);
    });
    setStatus("saved");
  };

  const fieldClass =
    "mt-2 w-full rounded-xl border-0 bg-[rgba(116,129,95,0.1)] px-4 py-3 text-[0.92rem] font-medium outline-none focus-visible:shadow-[0_0_0_2px_#f3f5ef,0_0_0_4px_#f9a137]";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          {profileCopy.title}
        </h1>
        <p className="mt-2 text-[0.95rem] font-medium text-black/50">
          {profileCopy.lede}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <aside className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)]">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex size-16 items-center justify-center rounded-full bg-logo-gradient text-[1.1rem] font-extrabold text-[#0d120b]">
              {demoCustomer.initials}
            </span>
            <p className="mt-3 text-[1rem] font-extrabold text-[#0d120b]">
              {values.name}
            </p>
            <p className="text-[0.82rem] font-medium text-black/45">
              {values.company}
            </p>
            <p className="mt-3 rounded-full bg-[rgba(116,129,95,0.14)] px-3 py-1 text-[0.7rem] font-extrabold tracking-[0.1em] text-brand uppercase">
              {demoCustomer.plan}
            </p>
            <p className="mt-3 text-[0.78rem] font-medium text-black/40">
              Member since {demoCustomer.memberSince}
            </p>
          </div>
        </aside>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6"
        >
          {status === "saved" ? (
            <p
              role="status"
              className="mb-4 rounded-xl border border-brand/25 bg-[rgba(116,129,95,0.1)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
            >
              {profileCopy.saved}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["name", "Full name", values.name],
                ["email", "Email", values.email],
                ["company", "Company", values.company],
                ["role", "Role", values.role],
                ["phone", "Phone", values.phone],
                ["location", "Location", values.location],
              ] as const
            ).map(([key, label, value]) => (
              <div key={key} className={key === "email" ? "sm:col-span-2" : ""}>
                <label
                  htmlFor={`${formId}-${key}`}
                  className="block text-[0.8rem] font-bold text-[#0d120b]"
                >
                  {label}
                </label>
                <input
                  id={`${formId}-${key}`}
                  name={key}
                  type={key === "email" ? "email" : "text"}
                  value={value}
                  onChange={(event) => setField(key, event.target.value)}
                  required
                  className={fieldClass}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-5 rounded-xl bg-logo-gradient px-5 py-2.5 text-[0.82rem] font-extrabold text-[#0d120b] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-70"
          >
            {status === "loading" ? profileCopy.saving : profileCopy.save}
          </button>
        </form>
      </div>
    </div>
  );
}
