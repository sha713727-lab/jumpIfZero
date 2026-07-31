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
  type AdminClient,
  type AdminEmployee,
  type AdminFile,
  type AdminLead,
  type AdminLeadFollowUp,
  type AdminMessage,
  type AdminProject,
  type AdminSale,
  type AdminSalesMessage,
} from "@/lib/data/admin";

type EmployeeDemoState = {
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

type EmployeeDemoContextValue = {
  readonly state: EmployeeDemoState;
  readonly setProjects: (items: AdminProject[]) => void;
  readonly setMessages: (items: AdminMessage[]) => void;
  readonly setFiles: (items: AdminFile[]) => void;
  readonly setSales: (items: AdminSale[]) => void;
  readonly setLeads: (items: AdminLead[]) => void;
  readonly setLeadFollowUps: (items: AdminLeadFollowUp[]) => void;
  readonly setSalesMessages: (items: AdminSalesMessage[]) => void;
  readonly updateProjectNotes: (projectId: string, notes: string) => void;
};

const EmployeeDemoContext = createContext<EmployeeDemoContextValue | null>(
  null,
);

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

function buildState(employeeId: string): EmployeeDemoState {
  const employee = initialAdminDemoState.employees.find(
    (item) => item.id === employeeId && item.active,
  );

  if (!employee) {
    throw new Error("Employee session is invalid");
  }

  const clients = initialAdminDemoState.clients.filter((client) =>
    client.assignedEmployeeIds.includes(employeeId),
  );
  const clientIds = new Set(clients.map((client) => client.id));

  const salesPeers = initialAdminDemoState.employees.filter(
    (item) =>
      item.active && item.kind === "sales" && item.id !== employeeId,
  );

  const peerIds = new Set(salesPeers.map((item) => item.id));

  return {
    employee,
    clients,
    projects: initialAdminDemoState.projects.filter((project) =>
      clientIds.has(project.clientId),
    ),
    messages: initialAdminDemoState.messages.filter((message) =>
      clientIds.has(message.clientId),
    ),
    files: initialAdminDemoState.files.filter((file) =>
      clientIds.has(file.clientId),
    ),
    sales: initialAdminDemoState.sales.filter(
      (sale) => sale.repId === employeeId,
    ),
    leads: initialAdminDemoState.leads.filter(
      (lead) => lead.repId === employeeId,
    ),
    leadFollowUps: initialAdminDemoState.leadFollowUps.filter((followUp) =>
      initialAdminDemoState.leads.some(
        (lead) => lead.id === followUp.leadId && lead.repId === employeeId,
      ),
    ),
    salesMessages: initialAdminDemoState.salesMessages.filter(
      (message) =>
        (message.fromRepId === employeeId && peerIds.has(message.toRepId)) ||
        (message.toRepId === employeeId && peerIds.has(message.fromRepId)),
    ),
    salesPeers,
  };
}

export function EmployeeDemoProvider({
  employeeId,
  children,
}: Readonly<{
  employeeId: string;
  children: ReactNode;
}>) {
  const [state, setState] = useState<EmployeeDemoState>(() =>
    buildState(employeeId),
  );

  const value = useMemo<EmployeeDemoContextValue>(
    () => ({
      state,
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
      updateProjectNotes: (projectId, notes) =>
        setState((current) => ({
          ...current,
          projects: current.projects.map((project) =>
            project.id === projectId
              ? { ...project, notes, updatedAt: todayLabel() }
              : project,
          ),
        })),
    }),
    [state],
  );

  return (
    <EmployeeDemoContext.Provider value={value}>
      {children}
    </EmployeeDemoContext.Provider>
  );
}

export function useEmployeeDemo(): EmployeeDemoContextValue {
  const context = useContext(EmployeeDemoContext);

  if (!context) {
    throw new Error("useEmployeeDemo requires EmployeeDemoProvider");
  }

  return context;
}
