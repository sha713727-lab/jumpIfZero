import type { Actor } from "@jumpifzero/contracts";
import type {
  AdminEmployee,
  AdminLead,
  AdminLeadFollowUp,
  AdminSale,
  AdminSalesMessage,
} from "@jumpifzero/contracts/admin";
import {
  listAdminLeadFollowUpsForLeads,
  listAdminLeads,
  listAdminSales,
  listAdminSalesMessages,
} from "@/lib/data/adminCrm";
import { listAdminEmployees } from "@/lib/data/adminOverviewBootstrap";
import { loadEmployeeSelf } from "@/lib/data/employeeDeliveryBootstrap";

export type AdminCrmBootstrap = {
  readonly sales: readonly AdminSale[];
  readonly leads: readonly AdminLead[];
  readonly leadFollowUps: readonly AdminLeadFollowUp[];
  readonly salesMessages: readonly AdminSalesMessage[];
};

export type AdminCrmSalesBootstrap = {
  readonly sales: readonly AdminSale[];
  readonly employees: readonly AdminEmployee[];
};

export type AdminCrmLeadsBootstrap = {
  readonly leads: readonly AdminLead[];
  readonly employees: readonly AdminEmployee[];
  readonly leadFollowUps: readonly AdminLeadFollowUp[];
};

export type EmployeeCrmBootstrap = AdminCrmBootstrap & {
  readonly employee: AdminEmployee;
  readonly salesPeers: readonly AdminEmployee[];
};

export async function loadAdminCrmSalesBootstrap(
  actor: Actor,
): Promise<AdminCrmSalesBootstrap> {
  const [sales, employees] = await Promise.all([
    listAdminSales(actor),
    listAdminEmployees(actor),
  ]);
  return { sales, employees };
}

export async function loadAdminCrmLeadsBootstrap(
  actor: Actor,
): Promise<AdminCrmLeadsBootstrap> {
  const [leads, employees] = await Promise.all([
    listAdminLeads(actor),
    listAdminEmployees(actor),
  ]);
  const leadFollowUps = await listAdminLeadFollowUpsForLeads(
    actor,
    leads.map((lead) => lead.id),
  );
  return { leads, employees, leadFollowUps };
}

export async function loadAdminCrmBootstrap(
  actor: Actor,
): Promise<AdminCrmBootstrap> {
  const [sales, leads] = await Promise.all([
    listAdminSales(actor),
    listAdminLeads(actor),
  ]);
  const leadIds = leads.map((lead) => lead.id);
  const [leadFollowUps, salesMessages] = await Promise.all([
    listAdminLeadFollowUpsForLeads(actor, leadIds),
    listAdminSalesMessages(actor),
  ]);
  return { sales, leads, leadFollowUps, salesMessages };
}

export async function loadEmployeeCrmBootstrap(
  actor: Actor,
  employeeId: string,
): Promise<EmployeeCrmBootstrap> {
  const [crm, employee, employees] = await Promise.all([
    loadAdminCrmBootstrap(actor),
    loadEmployeeSelf(actor, employeeId),
    listAdminEmployees(actor),
  ]);
  const salesPeers = employees
    .filter(
      (item) =>
        item.kind === "sales" && item.active && item.id !== employeeId,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    ...crm,
    employee,
    salesPeers,
  };
}
