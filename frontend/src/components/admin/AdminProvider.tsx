"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  initialAdminDemoState,
  type AdminBlogPost,
  type AdminCallback,
  type AdminClient,
  type AdminContactMessage,
  type AdminDemoState,
  type AdminEmployee,
  type AdminFaq,
  type AdminFile,
  type AdminInvoice,
  type AdminLead,
  type AdminLeadFollowUp,
  type AdminMessage,
  type AdminPortfolioItem,
  type AdminProject,
  type AdminSale,
  type AdminSalesMessage,
  type AdminService,
  type AdminTeamMember,
  type AdminSiteGalleryImage,
  type AdminSiteTestimonial,
  type AdminSitePrinciple,
} from "@/lib/data/admin";
import type { ProjectStatus } from "@/constants/admin";
import { adminInitialsFromName } from "@/constants/adminAuth";
import {
  loadAdminDomainAction,
  type AdminDomain,
  type AdminDomainPayload,
} from "@/lib/data/adminDomainActions";

export type AdminIdentity = {
  readonly name: string;
  readonly email: string;
  readonly initials: string;
};

type AdminLoadedDomains = Record<AdminDomain, boolean>;

type AdminContextValue = {
  readonly identity: AdminIdentity;
  readonly setIdentity: (identity: {
    readonly name: string;
    readonly email: string;
  }) => void;
  readonly state: AdminDemoState;
  readonly isDomainLoaded: (domain: AdminDomain) => boolean;
  readonly ensureDomain: (domain: AdminDomain) => Promise<void>;
  readonly applyDomainPayload: (payload: AdminDomainPayload) => void;
  readonly setServices: (items: AdminService[]) => void;
  readonly setPortfolio: (items: AdminPortfolioItem[]) => void;
  readonly setBlog: (items: AdminBlogPost[]) => void;
  readonly setFaqs: (items: AdminFaq[]) => void;
  readonly setTeam: (items: AdminTeamMember[]) => void;
  readonly setSiteGallery: (items: AdminSiteGalleryImage[]) => void;
  readonly setSiteTestimonials: (items: AdminSiteTestimonial[]) => void;
  readonly setSitePrinciples: (items: AdminSitePrinciple[]) => void;
  readonly setEmployees: (items: AdminEmployee[]) => void;
  readonly setClients: (items: AdminClient[]) => void;
  readonly setProjects: (items: AdminProject[]) => void;
  readonly setMessages: (items: AdminMessage[]) => void;
  readonly setInvoices: (items: AdminInvoice[]) => void;
  readonly setFiles: (items: AdminFile[]) => void;
  readonly setCallbacks: (items: AdminCallback[]) => void;
  readonly setContactMessages: (items: AdminContactMessage[]) => void;
  readonly setSales: (items: AdminSale[]) => void;
  readonly setLeads: (items: AdminLead[]) => void;
  readonly setLeadFollowUps: (items: AdminLeadFollowUp[]) => void;
  readonly setSalesMessages: (items: AdminSalesMessage[]) => void;
  readonly updateProjectStatus: (id: string, status: ProjectStatus) => void;
  readonly assignEmployees: (clientId: string, employeeIds: string[]) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

const EMPTY_LOADED: AdminLoadedDomains = {
  overview: false,
  "cms-catalog": false,
  "cms-team": false,
  "cms-site": false,
  contact: false,
  callbacks: false,
  ops: false,
  employees: false,
  "crm-sales": false,
  "crm-leads": false,
  security: true,
};

function todayLabel(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export function adminTodayLabel(): string {
  return todayLabel();
}

export function AdminProvider({
  children,
  identity,
}: Readonly<{
  children: ReactNode;
  identity: AdminIdentity;
}>) {
  const [identityState, setIdentityState] = useState<AdminIdentity>(() => ({
    name: identity.name,
    email: identity.email,
    initials:
      identity.initials.length > 0
        ? identity.initials
        : adminInitialsFromName(identity.name),
  }));
  const [state, setState] = useState<AdminDemoState>(() => ({
    ...initialAdminDemoState,
  }));
  const [loaded, setLoaded] = useState<AdminLoadedDomains>(() => ({
    ...EMPTY_LOADED,
  }));
  const inflightRef = useRef<Partial<Record<AdminDomain, Promise<void>>>>({});

  const setIdentity = useCallback(
    (next: { readonly name: string; readonly email: string }) => {
      setIdentityState({
        name: next.name,
        email: next.email,
        initials: adminInitialsFromName(next.name),
      });
    },
    [],
  );

  const resolvedIdentity = identityState;

  const isDomainLoaded = useCallback(
    (domain: AdminDomain) => loaded[domain] === true,
    [loaded],
  );

  const applyDomainPayload = useCallback((payload: AdminDomainPayload) => {
    setState((current) => ({
      ...current,
      ...(payload.services ? { services: [...payload.services] } : {}),
      ...(payload.portfolio ? { portfolio: [...payload.portfolio] } : {}),
      ...(payload.blog ? { blog: [...payload.blog] } : {}),
      ...(payload.faqs ? { faqs: [...payload.faqs] } : {}),
      ...(payload.team ? { team: [...payload.team] } : {}),
      ...(payload.contactMessages
        ? { contactMessages: [...payload.contactMessages] }
        : {}),
      ...(payload.callbacks ? { callbacks: [...payload.callbacks] } : {}),
      ...(payload.clients ? { clients: [...payload.clients] } : {}),
      ...(payload.projects ? { projects: [...payload.projects] } : {}),
      ...(payload.invoices ? { invoices: [...payload.invoices] } : {}),
      ...(payload.messages ? { messages: [...payload.messages] } : {}),
      ...(payload.files ? { files: [...payload.files] } : {}),
      ...(payload.employees ? { employees: [...payload.employees] } : {}),
      ...(payload.sales ? { sales: [...payload.sales] } : {}),
      ...(payload.leads ? { leads: [...payload.leads] } : {}),
      ...(payload.leadFollowUps
        ? { leadFollowUps: [...payload.leadFollowUps] }
        : {}),
      ...(payload.siteGallery ? { siteGallery: [...payload.siteGallery] } : {}),
      ...(payload.siteTestimonials
        ? { siteTestimonials: [...payload.siteTestimonials] }
        : {}),
      ...(payload.sitePrinciples
        ? { sitePrinciples: [...payload.sitePrinciples] }
        : {}),
    }));
    setLoaded((current) => {
      const next = { ...current, [payload.domain]: true };
      if (payload.domain === "overview") {
        next["cms-catalog"] = true;
        next.callbacks = true;
      }
      if (payload.domain === "ops") {
        next.employees = true;
      }
      return next;
    });
  }, []);

  const ensureDomain = useCallback(
    async (domain: AdminDomain) => {
      if (domain === "security" || loaded[domain]) {
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
        counts[`admin:${domain}`] = (counts[`admin:${domain}`] ?? 0) + 1;
        root.__jzBootstrap = counts;
      }
      const pending = loadAdminDomainAction(domain)
        .then((payload) => {
          applyDomainPayload(payload);
        })
        .finally(() => {
          delete inflightRef.current[domain];
        });
      inflightRef.current[domain] = pending;
      await pending;
    },
    [applyDomainPayload, loaded],
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      identity: resolvedIdentity,
      setIdentity,
      state,
      isDomainLoaded,
      ensureDomain,
      applyDomainPayload,
      setServices: (services) => setState((current) => ({ ...current, services })),
      setPortfolio: (portfolio) =>
        setState((current) => ({ ...current, portfolio })),
      setBlog: (blog) => setState((current) => ({ ...current, blog })),
      setFaqs: (faqs) => setState((current) => ({ ...current, faqs })),
      setTeam: (team) => setState((current) => ({ ...current, team })),
      setSiteGallery: (siteGallery) =>
        setState((current) => ({ ...current, siteGallery })),
      setSiteTestimonials: (siteTestimonials) =>
        setState((current) => ({ ...current, siteTestimonials })),
      setSitePrinciples: (sitePrinciples) =>
        setState((current) => ({ ...current, sitePrinciples })),
      setEmployees: (employees) =>
        setState((current) => ({ ...current, employees })),
      setClients: (clients) => setState((current) => ({ ...current, clients })),
      setProjects: (projects) =>
        setState((current) => ({ ...current, projects })),
      setMessages: (messages) =>
        setState((current) => ({ ...current, messages })),
      setInvoices: (invoices) =>
        setState((current) => ({ ...current, invoices })),
      setFiles: (files) => setState((current) => ({ ...current, files })),
      setCallbacks: (callbacks) =>
        setState((current) => ({ ...current, callbacks })),
      setContactMessages: (contactMessages) =>
        setState((current) => ({ ...current, contactMessages })),
      setSales: (sales) => setState((current) => ({ ...current, sales })),
      setLeads: (leads) => setState((current) => ({ ...current, leads })),
      setLeadFollowUps: (leadFollowUps) =>
        setState((current) => ({ ...current, leadFollowUps })),
      setSalesMessages: (salesMessages) =>
        setState((current) => ({ ...current, salesMessages })),
      updateProjectStatus: (id, status) =>
        setState((current) => ({
          ...current,
          projects: current.projects.map((project) =>
            project.id === id
              ? { ...project, status, updatedAt: todayLabel() }
              : project,
          ),
        })),
      assignEmployees: (clientId, employeeIds) =>
        setState((current) => ({
          ...current,
          clients: current.clients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  assignedEmployeeIds: employeeIds,
                  updatedAt: todayLabel(),
                }
              : client,
          ),
        })),
    }),
    [applyDomainPayload, ensureDomain, isDomainLoaded, resolvedIdentity, setIdentity, state],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdmin requires AdminProvider");
  }

  return context;
}
