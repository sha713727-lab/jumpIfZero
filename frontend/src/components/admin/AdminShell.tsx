"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { adminIcons } from "@/components/admin/AdminIcons";
import {
  AdminProvider,
  useAdmin,
  type AdminIdentity,
} from "@/components/admin/AdminProvider";
import {
  adminNavGroups,
  adminOverviewCopy,
  type AdminNavId,
} from "@/constants/admin";
import { site } from "@/constants/site";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import { submitSignOut } from "@/lib/submitSignOut";

const logoStyle = { width: 32, height: 31 } as const;

function navIdFromPath(pathname: string): AdminNavId {
  if (pathname === "/admin") {
    return "overview";
  }

  for (const group of adminNavGroups) {
    for (const item of group.items) {
      if (item.href === "/admin") {
        continue;
      }

      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item.id;
      }
    }
  }

  if (pathname.startsWith("/admin/clients")) {
    return "clients";
  }

  return "overview";
}

function AdminShellInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { identity } = useAdmin();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const activeId = navIdFromPath(pathname);
  const SignOutIcon = adminIcons.signOut;
  const MenuIcon = adminIcons.menu;
  const CloseIcon = adminIcons.close;

  const onSignOut = async () => {
    if (signingOut) {
      return;
    }

    setSigningOut(true);
    await submitSignOut("admin");
    router.replace("/admin/login");
  };

  const avatarSrc = cmsMediaSrc(identity.image);
  const avatar = avatarSrc ? (
    <span className="relative inline-flex size-9 overflow-hidden rounded-full border border-black/8">
      <Image
        src={avatarSrc}
        alt=""
        fill
        unoptimized
        className="object-cover"
        sizes="36px"
      />
    </span>
  ) : (
    <span className="inline-flex size-9 items-center justify-center rounded-full bg-logo-gradient text-[0.72rem] font-extrabold text-[#0d120b]">
      {identity.initials}
    </span>
  );

  const nav = (
    <nav
      aria-label="Admin"
      className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-6"
    >
      {adminNavGroups.map((group) => (
        <div key={group.id}>
          {group.label ? (
            <p className="mb-1.5 px-3 text-[0.68rem] font-extrabold tracking-[0.16em] text-black/35 uppercase">
              {group.label}
            </p>
          ) : null}
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const Icon = adminIcons[item.id];
              const active = item.id === activeId;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch
                  onClick={() => setOpen(false)}
                  className={`inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.92rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
                    active
                      ? "bg-[rgba(92,104,73,0.16)] text-brand"
                      : "text-[#0d120b]/70 hover:bg-black/[0.04] hover:text-[#0d120b]"
                  }`}
                >
                  <Icon className="size-[1.15rem] shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-[100svh] bg-[#f3f5ef] text-[#0d120b]">
      <div className="mx-auto flex min-h-[100svh] max-w-[1600px]">
        <aside className="sticky top-0 hidden h-[100svh] w-[16.5rem] shrink-0 flex-col border-r border-black/8 bg-white md:flex">
          <div className="flex items-center gap-2.5 px-5 py-5">
            <Image
              src="/images/jumpIfZeroLogo.png"
              alt=""
              aria-hidden="true"
              width={32}
              height={31}
              style={logoStyle}
            />
            <div className="min-w-0">
              <p className="truncate text-[0.82rem] font-extrabold tracking-[-0.01em]">
                {site.name}
              </p>
              <p className="truncate text-[0.72rem] font-medium text-black/45">
                Admin portal
              </p>
            </div>
          </div>
          {nav}
          <div className="mt-auto border-t border-black/8 px-4 py-4">
            <div className="flex items-center gap-3">
              {avatar}
              <div className="min-w-0">
                <p className="truncate text-[0.84rem] font-bold">
                  {identity.name}
                </p>
                <p className="truncate text-[0.72rem] text-black/45">Admin</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-black/8 bg-[#f3f5ef]/90 px-4 py-4 backdrop-blur-md md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                className="inline-flex size-10 items-center justify-center rounded-xl border border-black/10 bg-white text-[#0d120b] md:hidden"
                onClick={() => setOpen((value) => !value)}
              >
                {open ? (
                  <CloseIcon className="size-5" />
                ) : (
                  <MenuIcon className="size-5" />
                )}
              </button>
              <div className="min-w-0 md:hidden">
                <p className="truncate text-[0.9rem] font-extrabold">
                  {site.name}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-xl border border-black/12 bg-white px-3.5 py-2 text-[0.84rem] font-semibold text-[#0d120b] transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <SignOutIcon className="size-4" />
              {adminOverviewCopy.signOut}
            </button>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button
          type="button"
          aria-label="Close menu overlay"
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute top-0 left-0 flex h-full w-[min(18rem,86vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center gap-2.5 px-5 py-5">
            <Image
              src="/images/jumpIfZeroLogo.png"
              alt=""
              aria-hidden="true"
              width={32}
              height={31}
              style={logoStyle}
            />
            <div className="min-w-0">
              <p className="truncate text-[0.82rem] font-extrabold">
                {site.name}
              </p>
              <p className="truncate text-[0.72rem] font-medium text-black/45">
                Admin portal
              </p>
            </div>
          </div>
          {nav}
        </aside>
      </div>
    </div>
  );
}

export function AdminShell({
  children,
  identity,
}: Readonly<{
  children: React.ReactNode;
  identity: AdminIdentity;
}>) {
  return (
    <AdminProvider identity={identity}>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminProvider>
  );
}
