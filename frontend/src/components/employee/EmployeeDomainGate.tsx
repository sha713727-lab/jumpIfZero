"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { EmployeeDomain } from "@/lib/data/employeeDomainActions";
import { useEmployee } from "@/components/employee/EmployeeProvider";

function EmployeeDomainLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="h-10 w-52 rounded-xl bg-black/10" />
      <div className="h-5 w-72 max-w-full rounded-lg bg-black/8" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 rounded-2xl bg-white/80" />
        <div className="h-40 rounded-2xl bg-white/80" />
      </div>
      <div className="h-64 rounded-2xl bg-white/80" />
    </div>
  );
}

export function EmployeeDomainGate({
  domain,
  children,
}: Readonly<{
  domain: EmployeeDomain;
  children: ReactNode;
}>) {
  const { isDomainLoaded, ensureDomain } = useEmployee();
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
    throw new Error(`Failed to load employee domain: ${domain}`);
  }

  if (!loaded && !asyncReady) {
    return <EmployeeDomainLoading />;
  }

  return children;
}
