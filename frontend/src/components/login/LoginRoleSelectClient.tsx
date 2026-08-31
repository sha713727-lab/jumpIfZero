"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { loginRoleSelectCopy } from "@/constants/login";
import { site } from "@/constants/site";
import { applyHeaderTone } from "@/lib/headerTone";

const HEADER_HEIGHT = 72;
const PAGE_BG = "#f7f5f0";

function AdminIcon({ className }: { readonly className?: string }) {
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
      <path d="M12 3 4.5 6.5v5c0 4.4 3.1 7.8 7.5 9 4.4-1.2 7.5-4.6 7.5-9v-5L12 3Z" />
      <path d="M9.5 12.2 11.2 14l3.3-3.8" />
    </svg>
  );
}

function EmployeeIcon({ className }: { readonly className?: string }) {
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
      <path d="M8 7V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8V7" />
      <rect x="3.5" y="7" width="17" height="13" rx="2" />
      <path d="M3.5 12h17" />
    </svg>
  );
}

function ClientIcon({ className }: { readonly className?: string }) {
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
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2c1.6-3.2 4-4.8 6.5-4.8s4.9 1.6 6.5 4.8" />
    </svg>
  );
}

function GuestIcon({ className }: { readonly className?: string }) {
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
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.8 12h16.4" />
      <path d="M12 3.8c2.4 2.6 3.6 5.4 3.6 8.2S14.4 17.6 12 20.2C9.6 17.6 8.4 14.8 8.4 12S9.6 6.4 12 3.8Z" />
    </svg>
  );
}

const ROLE_ICONS = {
  admin: AdminIcon,
  employee: EmployeeIcon,
  client: ClientIcon,
  guest: GuestIcon,
} as const;

export function LoginRoleSelectClient() {
  const sectionRef = useRef<HTMLElement | null>(null);

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

  return (
    <main className="bg-cream text-black">
      <section
        ref={sectionRef}
        aria-label="Choose account type"
        data-header-tone="light"
        data-header-bg={PAGE_BG}
        className="flex min-h-[100svh] items-center justify-center px-5 py-28 md:px-8"
      >
        <div className="w-full max-w-3xl">
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
                {loginRoleSelectCopy.watermark}
              </p>
              <h1 className="relative text-[1.85rem] leading-none font-extrabold tracking-[0.08em] text-[#0d120b] uppercase">
                {loginRoleSelectCopy.title}
              </h1>
            </div>
            <p className="mt-3 max-w-[22rem] text-[0.88rem] leading-[1.45] font-medium text-black/45">
              {loginRoleSelectCopy.lede}
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {loginRoleSelectCopy.roles.map((role) => {
              const Icon = ROLE_ICONS[role.id];

              return (
                <li key={role.id}>
                  <Link
                    href={role.href}
                    className="group flex h-full flex-col rounded-2xl border border-[#0d120b]/10 bg-white/70 p-5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-secondary hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-logo-gradient text-[#0d120b]">
                      <Icon className="size-5" />
                    </span>
                    <span className="mt-4 text-[0.95rem] font-extrabold tracking-[0.06em] text-[#0d120b] uppercase">
                      {role.title}
                    </span>
                    <span className="mt-2 text-[0.84rem] leading-[1.45] font-medium text-black/50">
                      {role.description}
                    </span>
                    <span className="mt-5 text-[0.82rem] font-semibold text-brand transition-colors group-hover:text-[#2f3a28]">
                      Continue
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
