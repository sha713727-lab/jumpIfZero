"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import type { CustomerDomain } from "@/lib/data/customerDomainActions";

function CustomerDomainLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="h-10 w-48 rounded-xl bg-black/10" />
      <div className="h-5 w-80 max-w-full rounded-lg bg-black/8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-24 rounded-2xl bg-white/80" />
        <div className="h-24 rounded-2xl bg-white/80" />
        <div className="h-24 rounded-2xl bg-white/80" />
        <div className="h-24 rounded-2xl bg-white/80" />
      </div>
      <div className="h-64 rounded-2xl bg-white/80" />
    </div>
  );
}

export function CustomerDomainGate({
  domain,
  children,
}: Readonly<{
  domain: CustomerDomain;
  children: ReactNode;
}>) {
  const { isDomainLoaded, ensureDomain } = useDashboard();
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
    throw new Error(`Failed to load customer domain: ${domain}`);
  }

  if (!loaded && !asyncReady) {
    return <CustomerDomainLoading />;
  }

  return children;
}
