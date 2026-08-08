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
import {
  loadCustomerDomainAction,
  type CustomerDomain,
} from "@/lib/data/customerDomainActions";
import type {
  CustomerClient,
  CustomerFile,
  CustomerInvoice,
  CustomerMessage,
  CustomerPortalBootstrap,
  CustomerProject,
  CustomerShell,
  CustomerUser,
} from "@/lib/data/customerPortalTypes";

export type CustomerPortalState = {
  readonly user: CustomerUser;
  readonly client: CustomerClient;
  readonly shell: CustomerShell;
  readonly projects: CustomerProject[];
  readonly invoices: CustomerInvoice[];
  readonly messages: CustomerMessage[];
  readonly files: CustomerFile[];
};

type DashboardLoaded = Record<CustomerDomain, boolean>;

type DashboardContextValue = {
  readonly state: CustomerPortalState;
  readonly ready: boolean;
  readonly isDomainLoaded: (domain: CustomerDomain) => boolean;
  readonly ensureDomain: (domain: CustomerDomain) => Promise<void>;
  readonly applyDomainBootstrap: (domain: CustomerDomain, data: CustomerPortalBootstrap) => void;
  readonly setUser: (user: CustomerUser) => void;
  readonly setClient: (client: CustomerClient) => void;
  readonly setShell: (shell: CustomerShell) => void;
  readonly setProjects: (projects: CustomerProject[]) => void;
  readonly setInvoices: (invoices: CustomerInvoice[]) => void;
  readonly setMessages: (messages: CustomerMessage[]) => void;
  readonly setFiles: (files: CustomerFile[]) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

const EMPTY_LOADED: DashboardLoaded = {
  home: false,
  projects: false,
  invoices: false,
  messages: false,
  files: false,
  shell: false,
};

const PLACEHOLDER_USER: CustomerUser = {
  id: "",
  name: "",
  title: "",
  email: "",
  version: 1,
};

const PLACEHOLDER_CLIENT: CustomerClient = {
  id: "",
  company: "",
  phone: "",
  location: "",
  clientContactTitle: "",
  plan: "",
  memberSince: "",
  statusCode: "active",
  version: 1,
};

const PLACEHOLDER_SHELL: CustomerShell = {
  name: "",
  company: "",
  initials: "",
  email: "",
  plan: "",
  memberSince: "",
  status: "",
};

export function DashboardProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [state, setState] = useState<CustomerPortalState>(() => ({
    user: PLACEHOLDER_USER,
    client: PLACEHOLDER_CLIENT,
    shell: PLACEHOLDER_SHELL,
    projects: [],
    invoices: [],
    messages: [],
    files: [],
  }));
  const [loaded, setLoaded] = useState<DashboardLoaded>(() => ({
    ...EMPTY_LOADED,
  }));
  const inflightRef = useRef<Partial<Record<CustomerDomain, Promise<void>>>>(
    {},
  );

  useEffect(() => {
    const root = window as Window & { __jzMounts?: Record<string, number> };
    const counts = root.__jzMounts ?? {};
    counts.dashboardProvider = (counts.dashboardProvider ?? 0) + 1;
    root.__jzMounts = counts;
  }, []);

  const isDomainLoaded = useCallback(
    (domain: CustomerDomain) => loaded[domain] === true,
    [loaded],
  );

  const applyDomainBootstrap = useCallback(
    (domain: CustomerDomain, data: CustomerPortalBootstrap) => {
      setState((current) => ({
        user: data.user,
        client: data.client,
        shell: data.shell,
        projects:
          domain === "home" || domain === "projects"
            ? [...data.projects]
            : current.projects,
        invoices:
          domain === "home" || domain === "invoices"
            ? [...data.invoices]
            : current.invoices,
        messages:
          domain === "home" || domain === "messages"
            ? [...data.messages]
            : current.messages,
        files:
          domain === "home" || domain === "files"
            ? [...data.files]
            : current.files,
      }));
      setLoaded((current) => {
        const next = { ...current, [domain]: true, shell: true };
        if (domain === "home") {
          next.projects = true;
          next.invoices = true;
          next.messages = true;
          next.files = true;
        }
        return next;
      });
    },
    [],
  );

  const ensureDomain = useCallback(
    async (domain: CustomerDomain) => {
      if (loaded[domain]) {
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
        counts[`customer:${domain}`] = (counts[`customer:${domain}`] ?? 0) + 1;
        root.__jzBootstrap = counts;
      }
      const pending = loadCustomerDomainAction(domain)
        .then((data) => {
          applyDomainBootstrap(domain, data);
        })
        .finally(() => {
          delete inflightRef.current[domain];
        });
      inflightRef.current[domain] = pending;
      await pending;
    },
    [applyDomainBootstrap, loaded],
  );

  const value = useMemo<DashboardContextValue>(
    () => ({
      state,
      ready: loaded.shell,
      isDomainLoaded,
      ensureDomain,
      applyDomainBootstrap,
      setUser: (user) => setState((current) => ({ ...current, user })),
      setClient: (client) => setState((current) => ({ ...current, client })),
      setShell: (shell) => setState((current) => ({ ...current, shell })),
      setProjects: (projects) =>
        setState((current) => ({ ...current, projects })),
      setInvoices: (invoices) =>
        setState((current) => ({ ...current, invoices })),
      setMessages: (messages) =>
        setState((current) => ({ ...current, messages })),
      setFiles: (files) => setState((current) => ({ ...current, files })),
    }),
    [applyDomainBootstrap, ensureDomain, isDomainLoaded, loaded.shell, state],
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (context === null) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
