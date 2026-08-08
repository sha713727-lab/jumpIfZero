"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AdminClient,
  AdminEmployee,
  AdminFile,
  AdminLead,
  AdminLeadFollowUp,
  AdminMessage,
  AdminProject,
  AdminSale,
  AdminSalesMessage,
} from "@/lib/data/admin";
import type { EmployeeCrmBootstrap } from "@/lib/data/adminCrmBootstrap";
import type { EmployeeDeliveryBootstrap } from "@/lib/data/employeeDeliveryBootstrap";
import { loadEmployeeDomainAction } from "@/lib/data/employeeDomainActions";

type EmployeeState = {
  employee: AdminEmployee;
  clients: AdminClient[];
  projects: AdminProject[];
  messages: AdminMessage[];
  files: AdminFile[];
  sales: AdminSale[];
  leads: AdminLead[];
  leadFollowUps: AdminLeadFollowUp[];
  salesMessages: AdminSalesMessage[];
  salesPeers: AdminEmployee[];
};

type EmployeeContextValue = {
  readonly state: EmployeeState;
  readonly isDomainLoaded: (domain: "crm" | "delivery") => boolean;
  readonly ensureDomain: (domain: "crm" | "delivery") => Promise<void>;
  readonly applyCrmBootstrap: (crm: EmployeeCrmBootstrap) => void;
  readonly applyDeliveryBootstrap: (data: EmployeeDeliveryBootstrap) => void;
  readonly setEmployee: (employee: AdminEmployee) => void;
  readonly setProjects: (items: AdminProject[]) => void;
  readonly setMessages: (items: AdminMessage[]) => void;
  readonly setFiles: (items: AdminFile[]) => void;
  readonly setSales: (items: AdminSale[]) => void;
  readonly setLeads: (items: AdminLead[]) => void;
  readonly setLeadFollowUps: (items: AdminLeadFollowUp[]) => void;
  readonly setSalesMessages: (items: AdminSalesMessage[]) => void;
};

const EmployeeContext = createContext<EmployeeContextValue | null>(null);

function todayLabel(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export function employeeTodayLabel(): string {
  return todayLabel();
}

function emptyState(employee: AdminEmployee): EmployeeState {
  return {
    employee,
    clients: [],
    projects: [],
    messages: [],
    files: [],
    sales: [],
    leads: [],
    leadFollowUps: [],
    salesMessages: [],
    salesPeers: [],
  };
}

export function EmployeeProvider({
  employee,
  children,
}: Readonly<{
  employee: AdminEmployee;
  children: ReactNode;
}>) {
  const [state, setState] = useState<EmployeeState>(() => emptyState(employee));
  const [loadedCrm, setLoadedCrm] = useState(false);
  const [loadedDelivery, setLoadedDelivery] = useState(false);
  const inflightRef = useRef<Partial<Record<"crm" | "delivery", Promise<void>>>>(
    {},
  );

  useEffect(() => {
    const root = window as Window & { __jzMounts?: Record<string, number> };
    const counts = root.__jzMounts ?? {};
    counts.employeeProvider = (counts.employeeProvider ?? 0) + 1;
    root.__jzMounts = counts;
  }, []);

  const isDomainLoaded = useCallback(
    (domain: "crm" | "delivery") =>
      domain === "crm" ? loadedCrm : loadedDelivery,
    [loadedCrm, loadedDelivery],
  );

  const applyCrmBootstrap = useCallback((crm: EmployeeCrmBootstrap) => {
    setState((current) => ({
      ...current,
      employee: crm.employee,
      sales: [...crm.sales],
      leads: [...crm.leads],
      leadFollowUps: [...crm.leadFollowUps],
      salesMessages: [...crm.salesMessages],
      salesPeers: [...crm.salesPeers],
    }));
    setLoadedCrm(true);
  }, []);

  const applyDeliveryBootstrap = useCallback(
    (data: EmployeeDeliveryBootstrap) => {
      setState((current) => ({
        ...current,
        employee: data.employee,
        clients: [...data.clients],
        projects: [...data.projects],
        messages: [...data.messages],
        files: [...data.files],
      }));
      setLoadedDelivery(true);
    },
    [],
  );

  const ensureDomain = useCallback(
    async (domain: "crm" | "delivery") => {
      if (domain === "crm" ? loadedCrm : loadedDelivery) {
        return;
      }
      const existing = inflightRef.current[domain];
      if (existing) {
        await existing;
        return;
      }
      if (typeof window !== "undefined") {
        const root = window as Window & {
          __jzBootstrap?: Record<string, number>;
        };
        const counts = root.__jzBootstrap ?? {};
        counts[`employee:${domain}`] = (counts[`employee:${domain}`] ?? 0) + 1;
        root.__jzBootstrap = counts;
      }
      const pending = loadEmployeeDomainAction(domain)
        .then((data) => {
          if (domain === "crm") {
            applyCrmBootstrap(data as EmployeeCrmBootstrap);
          } else {
            applyDeliveryBootstrap(data as EmployeeDeliveryBootstrap);
          }
        })
        .finally(() => {
          delete inflightRef.current[domain];
        });
      inflightRef.current[domain] = pending;
      await pending;
    },
    [applyCrmBootstrap, applyDeliveryBootstrap, loadedCrm, loadedDelivery],
  );

  const value = useMemo<EmployeeContextValue>(
    () => ({
      state,
      isDomainLoaded,
      ensureDomain,
      applyCrmBootstrap,
      applyDeliveryBootstrap,
      setEmployee: (next) => setState((current) => ({ ...current, employee: next })),
      setProjects: (projects) =>
        setState((current) => ({ ...current, projects })),
      setMessages: (messages) =>
        setState((current) => ({ ...current, messages })),
      setFiles: (files) => setState((current) => ({ ...current, files })),
      setSales: (sales) => setState((current) => ({ ...current, sales })),
      setLeads: (leads) => setState((current) => ({ ...current, leads })),
      setLeadFollowUps: (leadFollowUps) =>
        setState((current) => ({ ...current, leadFollowUps })),
      setSalesMessages: (salesMessages) =>
        setState((current) => ({ ...current, salesMessages })),
    }),
    [
      applyCrmBootstrap,
      applyDeliveryBootstrap,
      ensureDomain,
      isDomainLoaded,
      state,
    ],
  );

  return (
    <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>
  );
}

export function useEmployee(): EmployeeContextValue {
  const context = useContext(EmployeeContext);

  if (!context) {
    throw new Error("useEmployee requires EmployeeProvider");
  }

  return context;
}
