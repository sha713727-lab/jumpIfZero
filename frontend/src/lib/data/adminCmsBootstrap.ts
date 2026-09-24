import type { Actor } from "@jumpifzero/contracts/content";
import type {
  AdminBlogPost,
  AdminEmployee,
  AdminFaq,
  AdminPortfolioItem,
  AdminTeamMember,
} from "@jumpifzero/contracts/admin";
import { listAdminBlogPosts } from "@/lib/data/adminBlog";
import { listAdminCallbacks } from "@/lib/data/adminCallbacks";
import { listAdminContactMessages } from "@/lib/data/adminContact";
import { listAdminFaqs } from "@/lib/data/adminFaqs";
import { listAdminPortfolio } from "@/lib/data/adminPortfolio";
import { listAdminTeamMembers } from "@/lib/data/adminTeam";
import { listAdminEmployees } from "@/lib/data/adminOverviewBootstrap";

export type AdminCmsCatalogBootstrap = {
  readonly portfolio: readonly AdminPortfolioItem[];
  readonly blog: readonly AdminBlogPost[];
  readonly faqs: readonly AdminFaq[];
};

export type AdminCmsTeamBootstrap = {
  readonly team: readonly AdminTeamMember[];
  readonly employees: readonly AdminEmployee[];
};

export async function loadAdminCmsCatalogBootstrap(
  actor: Actor,
): Promise<AdminCmsCatalogBootstrap> {
  const [portfolio, blog, faqs] = await Promise.all([
    listAdminPortfolio(actor),
    listAdminBlogPosts(actor),
    listAdminFaqs(actor),
  ]);
  return { portfolio, blog, faqs };
}

export async function loadAdminCmsTeamBootstrap(
  actor: Actor,
): Promise<AdminCmsTeamBootstrap> {
  const [team, employees] = await Promise.all([
    listAdminTeamMembers(actor),
    listAdminEmployees(actor),
  ]);
  return { team, employees };
}

export async function loadAdminContactBootstrap(actor: Actor) {
  return listAdminContactMessages(actor);
}

export async function loadAdminCallbacksBootstrap(actor: Actor) {
  return listAdminCallbacks(actor);
}
