import type { Actor } from "@jumpifzero/contracts";
import {
  clientsListResponseSchema,
  employeePublicSchema,
  projectsListResponseSchema,
  type EmployeePublic,
} from "@jumpifzero/contracts";
import type {
  AdminClient,
  AdminEmployee,
  AdminFile,
  AdminMessage,
  AdminProject,
} from "@jumpifzero/contracts/admin";
import { backendRequest } from "@/lib/backend/client";
import {
  listAdminFilesForClients,
  listAdminMessagesForClients,
  toAdminClient,
  toAdminProject,
} from "@/lib/data/adminOperations";

export type EmployeeDeliveryBootstrap = {
  readonly employee: AdminEmployee;
  readonly clients: readonly AdminClient[];
  readonly projects: readonly AdminProject[];
  readonly messages: readonly AdminMessage[];
  readonly files: readonly AdminFile[];
};

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function toAdminEmployee(row: EmployeePublic): AdminEmployee {
  return {
    id: row.id,
    name: row.user?.name ?? row.title,
    email: row.user?.email ?? "",
    role: row.title,
    department: row.department,
    kind: row.kind,
    image: row.imagePath,
    active: row.archivedAt === null,
    teamMemberId: null,
    updatedAt: formatUpdatedAt(row.updatedAt),
  };
}

export async function loadEmployeeSelf(
  actor: Actor,
  employeeId: string,
): Promise<AdminEmployee> {
  const row = await backendRequest({
    method: "GET",
    path: `/employees/${employeeId}`,
    actor,
    outputSchema: employeePublicSchema,
  });
  if (row.archivedAt !== null) {
    throw new Error("Employee session is invalid");
  }
  return toAdminEmployee(row);
}

async function listDeliveryClients(actor: Actor): Promise<AdminClient[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/clients",
    query: { limit: "100" },
    actor,
    outputSchema: clientsListResponseSchema,
  });
  return response.items.map(toAdminClient);
}

export async function loadEmployeeDeliveryBootstrap(
  actor: Actor,
  employeeId: string,
): Promise<EmployeeDeliveryBootstrap> {
  const [employee, clients] = await Promise.all([
    loadEmployeeSelf(actor, employeeId),
    listDeliveryClients(actor),
  ]);
  const clientIds = clients.map((client) => client.id);
  const [projectsResponse, messages, files] = await Promise.all([
    backendRequest({
      method: "GET",
      path: "/projects",
      query: { limit: "100" },
      actor,
      outputSchema: projectsListResponseSchema,
    }),
    listAdminMessagesForClients(actor, clientIds),
    listAdminFilesForClients(actor, clientIds),
  ]);
  const serviceTitleById = new Map<string, string>();
  const projects = projectsResponse.items.map((row) =>
    toAdminProject(row, serviceTitleById),
  );
  return {
    employee,
    clients,
    projects,
    messages,
    files,
  };
}
