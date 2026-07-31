import {
  initialAdminDemoState,
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
  type AdminBlogPost,
  type EmployeeKind,
  type LeadStatus,
  type SaleStatus,
} from "@/constants/adminDemo";

export type {
  AdminBlogPost,
  AdminCallback,
  AdminClient,
  AdminContactMessage,
  AdminDemoState,
  AdminEmployee,
  AdminFaq,
  AdminFile,
  AdminInvoice,
  AdminLead,
  AdminLeadFollowUp,
  AdminMessage,
  AdminPortfolioItem,
  AdminProject,
  AdminSale,
  AdminSalesMessage,
  AdminService,
  AdminTeamMember,
  EmployeeKind,
  LeadStatus,
  SaleStatus,
};

export async function getAdminDemoState(): Promise<AdminDemoState> {
  return initialAdminDemoState;
}

export async function getClients(): Promise<readonly AdminClient[]> {
  return initialAdminDemoState.clients;
}

export async function getProjects(): Promise<readonly AdminProject[]> {
  return initialAdminDemoState.projects;
}

export async function getInvoices(): Promise<readonly AdminInvoice[]> {
  return initialAdminDemoState.invoices;
}

export async function getMessages(): Promise<readonly AdminMessage[]> {
  return initialAdminDemoState.messages;
}

export async function getFiles(): Promise<readonly AdminFile[]> {
  return initialAdminDemoState.files;
}

export async function getSales(): Promise<readonly AdminSale[]> {
  return initialAdminDemoState.sales;
}

export async function getLeads(): Promise<readonly AdminLead[]> {
  return initialAdminDemoState.leads;
}

export async function getEmployees(): Promise<readonly AdminEmployee[]> {
  return initialAdminDemoState.employees;
}

export { initialAdminDemoState };
