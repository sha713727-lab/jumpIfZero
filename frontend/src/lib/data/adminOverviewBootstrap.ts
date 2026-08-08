import type { Actor } from "@jumpifzero/contracts";
import { employeesListResponseSchema } from "@jumpifzero/contracts";
import type {
  AdminCallback,
  AdminClient,
  AdminEmployee,
  AdminFaq,
  AdminPortfolioItem,
  AdminProject,
  AdminService,
  AdminBlogPost,
} from "@jumpifzero/contracts/admin";
import { backendRequest } from "@/lib/backend/client";
import { listAdminBlogPosts } from "@/lib/data/adminBlog";
import { listAdminCallbacks } from "@/lib/data/adminCallbacks";
import { listAdminFaqs } from "@/lib/data/adminFaqs";
import { listAdminPortfolio } from "@/lib/data/adminPortfolio";
import { listAdminServices } from "@/lib/data/adminServices";
import {
  listAdminClientsLite,
  listAdminProjects,
} from "@/lib/data/adminOperations";

export type AdminOverviewBootstrap = {
  readonly services: readonly AdminService[];
  readonly portfolio: readonly AdminPortfolioItem[];
  readonly blog: readonly AdminBlogPost[];
  readonly faqs: readonly AdminFaq[];
  readonly callbacks: readonly AdminCallback[];
  readonly clients: readonly AdminClient[];
  readonly projects: readonly AdminProject[];
};

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export async function listAdminEmployees(
  actor: Actor,
): Promise<AdminEmployee[]> {
  const query: Record<string, string> = { limit: "100" };
  if (actor.role === "employee" && actor.employeeKind === "sales") {
    query.kind = "sales";
    query.archived = "active";
  }
  const response = await backendRequest({
    method: "GET",
    path: "/employees",
    query,
    actor,
    outputSchema: employeesListResponseSchema,
  });
  return response.items.map((row) => ({
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
  }));
}

export async function loadAdminOverviewBootstrap(
  actor: Actor,
): Promise<AdminOverviewBootstrap> {
  const [services, portfolio, blog, faqs, callbacks, clients, rawProjects] =
    await Promise.all([
      listAdminServices(actor),
      listAdminPortfolio(actor),
      listAdminBlogPosts(actor),
      listAdminFaqs(actor),
      listAdminCallbacks(actor),
      listAdminClientsLite(actor),
      listAdminProjects(actor, new Map()),
    ]);
  const serviceTitleById = new Map(
    services.map((service) => [service.id, service.title] as const),
  );
  return {
    services,
    portfolio,
    blog,
    faqs,
    callbacks,
    clients,
    projects: rawProjects.map((project) => ({
      ...project,
      service: serviceTitleById.get(project.service) ?? project.service,
    })),
  };
}
