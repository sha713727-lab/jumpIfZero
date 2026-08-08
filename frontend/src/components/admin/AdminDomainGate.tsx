"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { AdminDomain } from "@/lib/data/adminDomainActions";
import { useAdmin } from "@/components/admin/AdminProvider";

function AdminDomainLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="h-10 w-56 rounded-xl bg-black/10" />
      <div className="h-5 w-96 max-w-full rounded-lg bg-black/8" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 rounded-2xl bg-white/80" />
        <div className="h-28 rounded-2xl bg-white/80" />
        <div className="h-28 rounded-2xl bg-white/80" />
      </div>
      <div className="h-72 rounded-2xl bg-white/80" />
    </div>
  );
}

export function AdminDomainGate({
  domain,
  children,
}: Readonly<{
  domain: AdminDomain;
  children: ReactNode;
}>) {
  const { isDomainLoaded, ensureDomain } = useAdmin();
  const loaded = isDomainLoaded(domain);
  const [asyncReady, setAsyncReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (loaded) {
      return;
    }
    let cancelled = false;
    void ensureDomain(domain)
      .then(() => {
        if (!cancelled) {
          setAsyncReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [domain, ensureDomain, loaded]);

  if (failed) {
    throw new Error(`Failed to load admin domain: ${domain}`);
  }

  if (!loaded && !asyncReady) {
    return <AdminDomainLoading />;
  }

  return children;
}
