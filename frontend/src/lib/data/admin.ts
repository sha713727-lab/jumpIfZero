import { initialAdminDemoState } from "@/constants/adminDemo";
import type {
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
} from "@/schemas/admin";

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
