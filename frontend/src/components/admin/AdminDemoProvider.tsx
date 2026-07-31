"use client";

import {
  createContext,
  useContext,
  useMemo,
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
} from "@/constants/adminDemo";
import type { ProjectStatus } from "@/constants/admin";

type AdminDemoContextValue = {
  readonly state: AdminDemoState;
  readonly setServices: (items: AdminService[]) => void;
  readonly setPortfolio: (items: AdminPortfolioItem[]) => void;
  readonly setBlog: (items: AdminBlogPost[]) => void;
  readonly setFaqs: (items: AdminFaq[]) => void;
  readonly setTeam: (items: AdminTeamMember[]) => void;
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

const AdminDemoContext = createContext<AdminDemoContextValue | null>(null);

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

export function AdminDemoProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<AdminDemoState>(initialAdminDemoState);

  const value = useMemo<AdminDemoContextValue>(
    () => ({
      state,
      setServices: (services) => setState((current) => ({ ...current, services })),
      setPortfolio: (portfolio) =>
        setState((current) => ({ ...current, portfolio })),
      setBlog: (blog) => setState((current) => ({ ...current, blog })),
      setFaqs: (faqs) => setState((current) => ({ ...current, faqs })),
      setTeam: (team) => setState((current) => ({ ...current, team })),
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
    [state],
  );

  return (
    <AdminDemoContext.Provider value={value}>
      {children}
    </AdminDemoContext.Provider>
  );
}

export function useAdminDemo(): AdminDemoContextValue {
  const context = useContext(AdminDemoContext);

  if (!context) {
    throw new Error("useAdminDemo requires AdminDemoProvider");
  }

  return context;
}
