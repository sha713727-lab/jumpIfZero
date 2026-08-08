"use server";

import type {
  AdminBlogPost,
  AdminCallback,
  AdminClient,
  AdminContactMessage,
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
  AdminService,
  AdminTeamMember,
  AdminSiteGalleryImage,
  AdminSiteTestimonial,
  AdminSitePrinciple,
} from "@jumpifzero/contracts/admin";
import { loadAdminCallbacksBootstrap } from "@/lib/data/adminCmsBootstrap";
import { loadAdminCmsCatalogBootstrap } from "@/lib/data/adminCmsBootstrap";
import { loadAdminCmsTeamBootstrap } from "@/lib/data/adminCmsBootstrap";
import { loadAdminContactBootstrap } from "@/lib/data/adminCmsBootstrap";
import { loadAdminCrmLeadsBootstrap } from "@/lib/data/adminCrmBootstrap";
import { loadAdminCrmSalesBootstrap } from "@/lib/data/adminCrmBootstrap";
import { loadAdminOpsBootstrap } from "@/lib/data/adminOpsBootstrap";
import { loadAdminOverviewBootstrap } from "@/lib/data/adminOverviewBootstrap";
import { listAdminEmployees } from "@/lib/data/adminOverviewBootstrap";
import { listAdminSiteGallery } from "@/lib/data/adminSiteGallery";
import { listAdminSitePrinciples } from "@/lib/data/adminSitePrinciples";
import { listAdminSiteTestimonials } from "@/lib/data/adminSiteTestimonials";
import { requireAdminActor } from "@/lib/data/adminSession";

export type AdminDomain =
  | "overview"
  | "cms-catalog"
  | "cms-team"
  | "cms-site"
  | "contact"
  | "callbacks"
  | "ops"
  | "employees"
  | "crm-sales"
  | "crm-leads"
  | "security";

export type AdminDomainPayload = {
  readonly domain: AdminDomain;
  readonly services?: readonly AdminService[];
  readonly portfolio?: readonly AdminPortfolioItem[];
  readonly blog?: readonly AdminBlogPost[];
  readonly faqs?: readonly AdminFaq[];
  readonly team?: readonly AdminTeamMember[];
  readonly contactMessages?: readonly AdminContactMessage[];
  readonly callbacks?: readonly AdminCallback[];
  readonly clients?: readonly AdminClient[];
  readonly projects?: readonly AdminProject[];
  readonly invoices?: readonly AdminInvoice[];
  readonly messages?: readonly AdminMessage[];
  readonly files?: readonly AdminFile[];
  readonly employees?: readonly AdminEmployee[];
  readonly sales?: readonly AdminSale[];
  readonly leads?: readonly AdminLead[];
  readonly leadFollowUps?: readonly AdminLeadFollowUp[];
  readonly siteGallery?: readonly AdminSiteGalleryImage[];
  readonly siteTestimonials?: readonly AdminSiteTestimonial[];
  readonly sitePrinciples?: readonly AdminSitePrinciple[];
};

export async function loadAdminDomainAction(
  domain: AdminDomain,
): Promise<AdminDomainPayload> {
  const { actor } = await requireAdminActor();

  if (domain === "security") {
    return { domain };
  }

  if (domain === "overview") {
    const data = await loadAdminOverviewBootstrap(actor);
    return {
      domain,
      services: data.services,
      portfolio: data.portfolio,
      blog: data.blog,
      faqs: data.faqs,
      callbacks: data.callbacks,
      clients: data.clients,
      projects: data.projects,
    };
  }

  if (domain === "cms-catalog") {
    const data = await loadAdminCmsCatalogBootstrap(actor);
    return {
      domain,
      services: data.services,
      portfolio: data.portfolio,
      blog: data.blog,
      faqs: data.faqs,
    };
  }

  if (domain === "cms-team") {
    const data = await loadAdminCmsTeamBootstrap(actor);
    return { domain, team: data.team, employees: data.employees };
  }

  if (domain === "cms-site") {
    const [siteGallery, siteTestimonials, sitePrinciples] = await Promise.all([
      listAdminSiteGallery(actor),
      listAdminSiteTestimonials(actor),
      listAdminSitePrinciples(actor),
    ]);
    return { domain, siteGallery, siteTestimonials, sitePrinciples };
  }

  if (domain === "contact") {
    return { domain, contactMessages: await loadAdminContactBootstrap(actor) };
  }

  if (domain === "callbacks") {
    return { domain, callbacks: await loadAdminCallbacksBootstrap(actor) };
  }

  if (domain === "ops") {
    const data = await loadAdminOpsBootstrap(actor);
    return {
      domain,
      services: data.services,
      clients: data.clients,
      projects: data.projects,
      invoices: data.invoices,
      messages: data.messages,
      files: data.files,
      employees: data.employees,
    };
  }

  if (domain === "employees") {
    return { domain, employees: await listAdminEmployees(actor) };
  }

  if (domain === "crm-sales") {
    const data = await loadAdminCrmSalesBootstrap(actor);
    return { domain, sales: data.sales, employees: data.employees };
  }

  const data = await loadAdminCrmLeadsBootstrap(actor);
  return {
    domain,
    leads: data.leads,
    employees: data.employees,
    leadFollowUps: data.leadFollowUps,
  };
}
