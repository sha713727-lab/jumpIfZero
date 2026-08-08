import type { Actor } from "@jumpifzero/contracts";
import type {
  AdminClient,
  AdminEmployee,
  AdminFile,
  AdminInvoice,
  AdminMessage,
  AdminProject,
  AdminService,
} from "@jumpifzero/contracts/admin";
import { listAdminServices } from "@/lib/data/adminServices";
import { listAdminEmployees } from "@/lib/data/adminOverviewBootstrap";
import {
  listAdminClients,
  listAdminFilesForClients,
  listAdminInvoices,
  listAdminMessagesForClients,
  listAdminProjects,
} from "@/lib/data/adminOperations";

export type AdminOpsBootstrap = {
  readonly clients: readonly AdminClient[];
  readonly projects: readonly AdminProject[];
  readonly invoices: readonly AdminInvoice[];
  readonly messages: readonly AdminMessage[];
  readonly files: readonly AdminFile[];
  readonly services: readonly AdminService[];
  readonly employees: readonly AdminEmployee[];
};

export async function loadAdminOpsBootstrap(
  actor: Actor,
): Promise<AdminOpsBootstrap> {
  const [services, employees, clients, invoices] = await Promise.all([
    listAdminServices(actor),
    listAdminEmployees(actor),
    listAdminClients(actor),
    listAdminInvoices(actor),
  ]);
  const serviceTitleById = new Map(
    services.map((service) => [service.id, service.title] as const),
  );
  const clientIds = clients.map((client) => client.id);
  const [projects, messages, files] = await Promise.all([
    listAdminProjects(actor, serviceTitleById),
    listAdminMessagesForClients(actor, clientIds),
    listAdminFilesForClients(actor, clientIds),
  ]);
  return {
    clients,
    projects,
    invoices,
    messages,
    files,
    services,
    employees,
  };
}
