import {
  servicePageBenefitCreateSchema,
  servicePageBenefitRowSchema,
  servicePageBenefitUpdateSchema,
  servicePageBuildItemCreateSchema,
  servicePageBuildItemRowSchema,
  servicePageBuildItemUpdateSchema,
  servicePageCapabilityCreateSchema,
  servicePageCapabilityRowSchema,
  servicePageCapabilityUpdateSchema,
  servicePageComparisonPointCreateSchema,
  servicePageComparisonPointRowSchema,
  servicePageComparisonPointUpdateSchema,
  servicePageDetailSchema,
  servicePageFaqCreateSchema,
  servicePageFaqRowSchema,
  servicePageFaqUpdateSchema,
  servicePageOfferingCreateSchema,
  servicePageOfferingRowSchema,
  servicePageOfferingUpdateSchema,
  servicePageProblemCreateSchema,
  servicePageProblemRowSchema,
  servicePageProblemUpdateSchema,
  servicePageProcessStepCreateSchema,
  servicePageProcessStepRowSchema,
  servicePageProcessStepUpdateSchema,
  servicePageRelatedCreateSchema,
  servicePageRelatedRowSchema,
  servicePageRelatedUpdateSchema,
  servicePagesListResponseSchema,
  servicePageTechnologyCreateSchema,
  servicePageTechnologyRowSchema,
  servicePageTechnologyUpdateSchema,
  servicePageUpdateSchema,
  type Actor,
  type ServicePageBenefitRow,
  type ServicePageBuildItemRow,
  type ServicePageCapabilityRow,
  type ServicePageComparisonPointRow,
  type ServicePageDetail,
  type ServicePageFaqRow,
  type ServicePageListItem,
  type ServicePageOfferingRow,
  type ServicePageProblemRow,
  type ServicePageProcessStepRow,
  type ServicePageRelatedRow,
  type ServicePageTechCategory,
  type ServicePageTechnologyRow,
} from "@jumpifzero/contracts";
import { z } from "@jumpifzero/contracts/z";
import { backendRequest } from "@/lib/backend/client";

export class ContractValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContractValidationError";
  }
}

function parseContract<T>(
  schema: z.ZodType<T>,
  data: unknown,
): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path =
      issue !== undefined && issue.path.length > 0
        ? issue.path.join(".")
        : "";
    const message = issue?.message ?? "Invalid input";
    throw new ContractValidationError(
      path.length > 0 ? `${path}: ${message}` : message,
    );
  }
  return parsed.data;
}

export type ServicePageCollection =
  | "offerings"
  | "build-items"
  | "process-steps"
  | "technologies"
  | "benefits"
  | "faqs"
  | "capabilities"
  | "problems"
  | "comparison-points"
  | "related";

export type AdminServicePageListItem = ServicePageListItem & {
  readonly active: boolean;
};

export type AdminServicePageOffering = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
  readonly imagePath: string;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly version: number;
  readonly publishedAt: string | null;
};

export type AdminServicePageBuildItem = {
  readonly id: string;
  readonly label: string;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly version: number;
  readonly publishedAt: string | null;
};

export type AdminServicePageProcessStep = {
  readonly id: string;
  readonly stepNumber: number;
  readonly title: string;
  readonly body: string;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly version: number;
  readonly publishedAt: string | null;
};

export type AdminServicePageTechnology = {
  readonly id: string;
  readonly category: ServicePageTechCategory;
  readonly name: string;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly version: number;
  readonly publishedAt: string | null;
};

export type AdminServicePageBenefit = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly version: number;
  readonly publishedAt: string | null;
};

export type AdminServicePageFaq = {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly version: number;
  readonly publishedAt: string | null;
};

export type AdminServicePageRelated = {
  readonly id: string;
  readonly relatedServicePageId: string;
  readonly title: string;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly version: number;
  readonly publishedAt: string | null;
};

export type AdminServicePageDetail = Omit<
  ServicePageDetail,
  | "offerings"
  | "buildItems"
  | "processSteps"
  | "technologies"
  | "benefits"
  | "capabilities"
  | "problems"
  | "comparisonPoints"
  | "faqs"
  | "related"
> & {
  readonly active: boolean;
  readonly offerings: readonly AdminServicePageOffering[];
  readonly buildItems: readonly AdminServicePageBuildItem[];
  readonly processSteps: readonly AdminServicePageProcessStep[];
  readonly technologies: readonly AdminServicePageTechnology[];
  readonly benefits: readonly AdminServicePageBenefit[];
  readonly capabilities: readonly AdminServicePageBenefit[];
  readonly problems: readonly AdminServicePageBenefit[];
  readonly comparisonPoints: readonly AdminServicePageBenefit[];
  readonly faqs: readonly AdminServicePageFaq[];
  readonly related: readonly AdminServicePageRelated[];
};

export type AdminServicePageChild =
  | AdminServicePageOffering
  | AdminServicePageBuildItem
  | AdminServicePageProcessStep
  | AdminServicePageTechnology
  | AdminServicePageBenefit
  | AdminServicePageFaq
  | AdminServicePageRelated;

const childRowSchema = z.union([
  servicePageOfferingRowSchema,
  servicePageBuildItemRowSchema,
  servicePageProcessStepRowSchema,
  servicePageTechnologyRowSchema,
  servicePageBenefitRowSchema,
  servicePageCapabilityRowSchema,
  servicePageProblemRowSchema,
  servicePageComparisonPointRowSchema,
  servicePageFaqRowSchema,
  servicePageRelatedRowSchema,
]);

function toIsoOrNull(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

function toAdminOffering(row: ServicePageOfferingRow): AdminServicePageOffering {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    imagePath: row.image_path,
    sortOrder: row.sort_order,
    active: row.published_at !== null,
    version: row.version,
    publishedAt: toIsoOrNull(row.published_at),
  };
}

function toAdminBuildItem(
  row: ServicePageBuildItemRow,
): AdminServicePageBuildItem {
  return {
    id: row.id,
    label: row.label,
    sortOrder: row.sort_order,
    active: row.published_at !== null,
    version: row.version,
    publishedAt: toIsoOrNull(row.published_at),
  };
}

function toAdminProcessStep(
  row: ServicePageProcessStepRow,
): AdminServicePageProcessStep {
  return {
    id: row.id,
    stepNumber: row.step_number,
    title: row.title,
    body: row.body,
    sortOrder: row.sort_order,
    active: row.published_at !== null,
    version: row.version,
    publishedAt: toIsoOrNull(row.published_at),
  };
}

function toAdminTechnology(
  row: ServicePageTechnologyRow,
): AdminServicePageTechnology {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    sortOrder: row.sort_order,
    active: row.published_at !== null,
    version: row.version,
    publishedAt: toIsoOrNull(row.published_at),
  };
}

function toAdminBenefit(row: ServicePageBenefitRow): AdminServicePageBenefit {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    sortOrder: row.sort_order,
    active: row.published_at !== null,
    version: row.version,
    publishedAt: toIsoOrNull(row.published_at),
  };
}

function toAdminTitledChild(
  row:
    | ServicePageBenefitRow
    | ServicePageCapabilityRow
    | ServicePageProblemRow
    | ServicePageComparisonPointRow,
): AdminServicePageBenefit {
  return toAdminBenefit(row);
}

function toAdminFaq(row: ServicePageFaqRow): AdminServicePageFaq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
    active: row.published_at !== null,
    version: row.version,
    publishedAt: toIsoOrNull(row.published_at),
  };
}

function toAdminRelated(row: ServicePageRelatedRow): AdminServicePageRelated {
  return {
    id: row.id,
    relatedServicePageId: row.related_service_page_id,
    title: "",
    sortOrder: row.sort_order,
    active: row.published_at !== null,
    version: row.version,
    publishedAt: toIsoOrNull(row.published_at),
  };
}

function toAdminRelatedFromSummary(
  item: ServicePageDetail["related"][number],
): AdminServicePageRelated {
  return {
    id: item.id,
    relatedServicePageId: item.page.id,
    title: item.page.title,
    sortOrder: item.sortOrder,
    active: true,
    version: 1,
    publishedAt: null,
  };
}

function toAdminChild(
  collection: ServicePageCollection,
  row: z.infer<typeof childRowSchema>,
): AdminServicePageChild {
  switch (collection) {
    case "offerings":
      return toAdminOffering(servicePageOfferingRowSchema.parse(row));
    case "build-items":
      return toAdminBuildItem(servicePageBuildItemRowSchema.parse(row));
    case "process-steps":
      return toAdminProcessStep(servicePageProcessStepRowSchema.parse(row));
    case "technologies":
      return toAdminTechnology(servicePageTechnologyRowSchema.parse(row));
    case "benefits":
      return toAdminBenefit(servicePageBenefitRowSchema.parse(row));
    case "capabilities":
      return toAdminTitledChild(servicePageCapabilityRowSchema.parse(row));
    case "problems":
      return toAdminTitledChild(servicePageProblemRowSchema.parse(row));
    case "comparison-points":
      return toAdminTitledChild(servicePageComparisonPointRowSchema.parse(row));
    case "faqs":
      return toAdminFaq(servicePageFaqRowSchema.parse(row));
    case "related":
      return toAdminRelated(servicePageRelatedRowSchema.parse(row));
  }
}

export function toAdminServicePageDetail(
  detail: ServicePageDetail,
): AdminServicePageDetail {
  return {
    id: detail.id,
    parentId: detail.parentId,
    sortOrder: detail.sortOrder,
    slug: detail.slug,
    title: detail.title,
    navLabel: detail.navLabel,
    metaTitle: detail.metaTitle,
    metaDescription: detail.metaDescription,
    ogTitle: detail.ogTitle,
    ogDescription: detail.ogDescription,
    ogImagePath: detail.ogImagePath,
    heroEyebrow: detail.heroEyebrow,
    heroH1: detail.heroH1,
    heroDescription: detail.heroDescription,
    heroPrimaryCtaLabel: detail.heroPrimaryCtaLabel,
    heroPrimaryCtaHref: detail.heroPrimaryCtaHref,
    heroSecondaryCtaLabel: detail.heroSecondaryCtaLabel,
    heroSecondaryCtaHref: detail.heroSecondaryCtaHref,
    heroImagePath: detail.heroImagePath,
    introHeading: detail.introHeading,
    introBody: detail.introBody,
    offeringsHeading: detail.offeringsHeading,
    buildHeading: detail.buildHeading,
    processHeading: detail.processHeading,
    technologiesHeading: detail.technologiesHeading,
    benefitsHeading: detail.benefitsHeading,
    benefitsIntro: detail.benefitsIntro,
    capabilitiesHeading: detail.capabilitiesHeading,
    capabilitiesIntro: detail.capabilitiesIntro,
    problemsHeading: detail.problemsHeading,
    problemsIntro: detail.problemsIntro,
    comparisonHeading: detail.comparisonHeading,
    comparisonBody: detail.comparisonBody,
    faqsHeading: detail.faqsHeading,
    ctaHeading: detail.ctaHeading,
    ctaBody: detail.ctaBody,
    ctaLabel: detail.ctaLabel,
    ctaHref: detail.ctaHref,
    href: detail.href,
    publishedAt: detail.publishedAt,
    version: detail.version,
    updatedAt: detail.updatedAt,
    parent: detail.parent,
    children: detail.children,
    active: detail.publishedAt !== null,
    offerings: detail.offerings.map(toAdminOffering),
    buildItems: detail.buildItems.map(toAdminBuildItem),
    processSteps: detail.processSteps.map(toAdminProcessStep),
    technologies: detail.technologies.map(toAdminTechnology),
    benefits: detail.benefits.map(toAdminBenefit),
    capabilities: detail.capabilities.map(toAdminTitledChild),
    problems: detail.problems.map(toAdminTitledChild),
    comparisonPoints: detail.comparisonPoints.map(toAdminTitledChild),
    faqs: detail.faqs.map(toAdminFaq),
    related: detail.related.map(toAdminRelatedFromSummary),
  };
}

export async function listAdminServicePages(
  actor: Actor,
): Promise<AdminServicePageListItem[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/content/service-pages",
    query: {
      limit: "100",
      publishedOnly: "false",
      sort: "updated_at",
      dir: "desc",
    },
    actor,
    outputSchema: servicePagesListResponseSchema,
  });
  return response.items.map((item) => ({
    ...item,
    active: item.publishedAt !== null,
  }));
}

export async function getAdminServicePageBySlug(
  actor: Actor,
  slug: string,
): Promise<AdminServicePageDetail> {
  const detail = await backendRequest({
    method: "GET",
    path: `/content/service-pages/by-slug/${encodeURIComponent(slug)}`,
    actor,
    outputSchema: servicePageDetailSchema,
  });
  return toAdminServicePageDetail(detail);
}

export async function updateAdminServicePage(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly title: string;
    readonly navLabel: string;
    readonly metaTitle: string;
    readonly metaDescription: string;
    readonly ogTitle: string;
    readonly ogDescription: string;
    readonly ogImagePath: string;
    readonly heroEyebrow: string;
    readonly heroH1: string;
    readonly heroDescription: string;
    readonly heroPrimaryCtaLabel: string;
    readonly heroPrimaryCtaHref: string;
    readonly heroSecondaryCtaLabel: string;
    readonly heroSecondaryCtaHref: string;
    readonly heroImagePath: string;
    readonly introHeading: string;
    readonly introBody: string;
    readonly offeringsHeading: string;
    readonly buildHeading: string;
    readonly processHeading: string;
    readonly technologiesHeading: string;
    readonly benefitsHeading: string;
    readonly benefitsIntro: string;
    readonly capabilitiesHeading: string;
    readonly capabilitiesIntro: string;
    readonly problemsHeading: string;
    readonly problemsIntro: string;
    readonly comparisonHeading: string;
    readonly comparisonBody: string;
    readonly faqsHeading: string;
    readonly ctaHeading: string;
    readonly ctaBody: string;
    readonly ctaLabel: string;
    readonly ctaHref: string;
    readonly sortOrder: number;
    readonly active: boolean;
    readonly publishedAt: string | null;
  },
): Promise<AdminServicePageDetail> {
  const body = parseContract(servicePageUpdateSchema, {
    id: input.id,
    version: input.version,
    title: input.title,
    navLabel: input.navLabel,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    ogTitle: input.ogTitle,
    ogDescription: input.ogDescription,
    ogImagePath: input.ogImagePath,
    heroEyebrow: input.heroEyebrow,
    heroH1: input.heroH1,
    heroDescription: input.heroDescription,
    heroPrimaryCtaLabel: input.heroPrimaryCtaLabel,
    heroPrimaryCtaHref: input.heroPrimaryCtaHref,
    heroSecondaryCtaLabel: input.heroSecondaryCtaLabel,
    heroSecondaryCtaHref: input.heroSecondaryCtaHref,
    heroImagePath: input.heroImagePath,
    introHeading: input.introHeading,
    introBody: input.introBody,
    offeringsHeading: input.offeringsHeading,
    buildHeading: input.buildHeading,
    processHeading: input.processHeading,
    technologiesHeading: input.technologiesHeading,
    benefitsHeading: input.benefitsHeading,
    benefitsIntro: input.benefitsIntro,
    capabilitiesHeading: input.capabilitiesHeading,
    capabilitiesIntro: input.capabilitiesIntro,
    problemsHeading: input.problemsHeading,
    problemsIntro: input.problemsIntro,
    comparisonHeading: input.comparisonHeading,
    comparisonBody: input.comparisonBody,
    faqsHeading: input.faqsHeading,
    ctaHeading: input.ctaHeading,
    ctaBody: input.ctaBody,
    ctaLabel: input.ctaLabel,
    ctaHref: input.ctaHref,
    sortOrder: input.sortOrder,
    publishedAt: input.active
      ? (input.publishedAt ?? new Date().toISOString())
      : null,
  });

  const detail = await backendRequest({
    method: "PATCH",
    path: `/content/service-pages/${input.id}`,
    body: {
      version: body.version,
      title: body.title,
      navLabel: body.navLabel,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      ogTitle: body.ogTitle,
      ogDescription: body.ogDescription,
      ogImagePath: body.ogImagePath,
      heroEyebrow: body.heroEyebrow,
      heroH1: body.heroH1,
      heroDescription: body.heroDescription,
      heroPrimaryCtaLabel: body.heroPrimaryCtaLabel,
      heroPrimaryCtaHref: body.heroPrimaryCtaHref,
      heroSecondaryCtaLabel: body.heroSecondaryCtaLabel,
      heroSecondaryCtaHref: body.heroSecondaryCtaHref,
      heroImagePath: body.heroImagePath,
      introHeading: body.introHeading,
      introBody: body.introBody,
      offeringsHeading: body.offeringsHeading,
      buildHeading: body.buildHeading,
      processHeading: body.processHeading,
      technologiesHeading: body.technologiesHeading,
      benefitsHeading: body.benefitsHeading,
      benefitsIntro: body.benefitsIntro,
      capabilitiesHeading: body.capabilitiesHeading,
      capabilitiesIntro: body.capabilitiesIntro,
      problemsHeading: body.problemsHeading,
      problemsIntro: body.problemsIntro,
      comparisonHeading: body.comparisonHeading,
      comparisonBody: body.comparisonBody,
      faqsHeading: body.faqsHeading,
      ctaHeading: body.ctaHeading,
      ctaBody: body.ctaBody,
      ctaLabel: body.ctaLabel,
      ctaHref: body.ctaHref,
      sortOrder: body.sortOrder,
      publishedAt: body.publishedAt,
    },
    actor,
    outputSchema: servicePageDetailSchema,
  });
  return toAdminServicePageDetail(detail);
}

export async function archiveAdminServicePage(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/service-pages/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}

export async function restoreAdminServicePage(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<AdminServicePageDetail> {
  const detail = await backendRequest({
    method: "POST",
    path: `/content/service-pages/${input.id}/restore`,
    body: { version: input.version },
    actor,
    outputSchema: servicePageDetailSchema,
  });
  return toAdminServicePageDetail(detail);
}

export async function createAdminServicePageChild(
  actor: Actor,
  collection: ServicePageCollection,
  servicePageId: string,
  input: Record<string, unknown>,
): Promise<AdminServicePageChild> {
  const body = parseChildCreateBody(collection, servicePageId, input);
  const row = await backendRequest({
    method: "POST",
    path: `/content/service-pages/${servicePageId}/${collection}`,
    body,
    actor,
    outputSchema: childRowSchema,
  });
  return toAdminChild(collection, row);
}

export async function updateAdminServicePageChild(
  actor: Actor,
  collection: ServicePageCollection,
  servicePageId: string,
  childId: string,
  input: Record<string, unknown>,
): Promise<AdminServicePageChild> {
  const body = parseChildUpdateBody(collection, servicePageId, childId, input);
  const row = await backendRequest({
    method: "PATCH",
    path: `/content/service-pages/${servicePageId}/${collection}/${childId}`,
    body,
    actor,
    outputSchema: childRowSchema,
  });
  return toAdminChild(collection, row);
}

export async function archiveAdminServicePageChild(
  actor: Actor,
  collection: ServicePageCollection,
  servicePageId: string,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/service-pages/${servicePageId}/${collection}/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}

export async function restoreAdminServicePageChild(
  actor: Actor,
  collection: ServicePageCollection,
  servicePageId: string,
  input: { readonly id: string; readonly version: number },
): Promise<AdminServicePageChild> {
  const row = await backendRequest({
    method: "POST",
    path: `/content/service-pages/${servicePageId}/${collection}/${input.id}/restore`,
    body: { version: input.version },
    actor,
    outputSchema: childRowSchema,
  });
  return toAdminChild(collection, row);
}

export async function reorderAdminServicePageChildren(
  actor: Actor,
  collection: ServicePageCollection,
  servicePageId: string,
  items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[],
): Promise<void> {
  await backendRequest({
    method: "PUT",
    path: `/content/service-pages/${servicePageId}/${collection}/reorder`,
    body: { items: [...items] },
    actor,
    outputSchema: z.null(),
  });
}

function publishedAtFromActive(
  active: boolean,
  publishedAt: string | null | undefined,
): string | null {
  if (!active) {
    return null;
  }
  return publishedAt ?? new Date().toISOString();
}

function parseChildCreateBody(
  collection: ServicePageCollection,
  servicePageId: string,
  input: Record<string, unknown>,
): unknown {
  const active = input.active === true;
  const publishedAt = publishedAtFromActive(
    active,
    typeof input.publishedAt === "string" ? input.publishedAt : null,
  );
  const sortOrder =
    typeof input.sortOrder === "number" ? input.sortOrder : 0;

  switch (collection) {
    case "offerings":
      return parseContract(servicePageOfferingCreateSchema, {
        servicePageId,
        title: input.title,
        description: input.description ?? "",
        ctaLabel: input.ctaLabel ?? "",
        ctaHref: input.ctaHref ?? "",
        imagePath: input.imagePath ?? "",
        sortOrder,
        publishedAt,
      });
    case "build-items":
      return parseContract(servicePageBuildItemCreateSchema, {
        servicePageId,
        label: input.label,
        sortOrder,
        publishedAt,
      });
    case "process-steps":
      return parseContract(servicePageProcessStepCreateSchema, {
        servicePageId,
        stepNumber: input.stepNumber ?? 1,
        title: input.title,
        body: input.body ?? "",
        sortOrder,
        publishedAt,
      });
    case "technologies":
      return parseContract(servicePageTechnologyCreateSchema, {
        servicePageId,
        category: input.category,
        name: input.name,
        sortOrder,
        publishedAt,
      });
    case "benefits":
      return parseContract(servicePageBenefitCreateSchema, {
        servicePageId,
        title: input.title,
        body: input.body ?? "",
        sortOrder,
        publishedAt,
      });
    case "capabilities":
      return parseContract(servicePageCapabilityCreateSchema, {
        servicePageId,
        title: input.title,
        body: input.body ?? "",
        sortOrder,
        publishedAt,
      });
    case "problems":
      return parseContract(servicePageProblemCreateSchema, {
        servicePageId,
        title: input.title,
        body: input.body ?? "",
        sortOrder,
        publishedAt,
      });
    case "comparison-points":
      return parseContract(servicePageComparisonPointCreateSchema, {
        servicePageId,
        title: input.title,
        body: input.body ?? "",
        sortOrder,
        publishedAt,
      });
    case "faqs":
      return parseContract(servicePageFaqCreateSchema, {
        servicePageId,
        question: input.question,
        answer: input.answer,
        sortOrder,
        publishedAt,
      });
    case "related":
      return parseContract(servicePageRelatedCreateSchema, {
        servicePageId,
        relatedServicePageId: input.relatedServicePageId,
        sortOrder,
        publishedAt,
      });
  }
}

function parseChildUpdateBody(
  collection: ServicePageCollection,
  servicePageId: string,
  childId: string,
  input: Record<string, unknown>,
): unknown {
  const base = {
    id: childId,
    servicePageId,
    version: input.version,
    sortOrder: input.sortOrder ?? 0,
    publishedAt: publishedAtFromActive(
      input.active === true,
      typeof input.publishedAt === "string" ? input.publishedAt : null,
    ),
  };

  switch (collection) {
    case "offerings":
      return parseContract(servicePageOfferingUpdateSchema, {
        ...base,
        title: input.title,
        description: input.description ?? "",
        ctaLabel: input.ctaLabel ?? "",
        ctaHref: input.ctaHref ?? "",
        imagePath: input.imagePath ?? "",
      });
    case "build-items":
      return parseContract(servicePageBuildItemUpdateSchema, {
        ...base,
        label: input.label,
      });
    case "process-steps":
      return parseContract(servicePageProcessStepUpdateSchema, {
        ...base,
        stepNumber: input.stepNumber ?? 1,
        title: input.title,
        body: input.body ?? "",
      });
    case "technologies":
      return parseContract(servicePageTechnologyUpdateSchema, {
        ...base,
        category: input.category,
        name: input.name,
      });
    case "benefits":
      return parseContract(servicePageBenefitUpdateSchema, {
        ...base,
        title: input.title,
        body: input.body ?? "",
      });
    case "capabilities":
      return parseContract(servicePageCapabilityUpdateSchema, {
        ...base,
        title: input.title,
        body: input.body ?? "",
      });
    case "problems":
      return parseContract(servicePageProblemUpdateSchema, {
        ...base,
        title: input.title,
        body: input.body ?? "",
      });
    case "comparison-points":
      return parseContract(servicePageComparisonPointUpdateSchema, {
        ...base,
        title: input.title,
        body: input.body ?? "",
      });
    case "faqs":
      return parseContract(servicePageFaqUpdateSchema, {
        ...base,
        question: input.question,
        answer: input.answer,
      });
    case "related":
      return parseContract(servicePageRelatedUpdateSchema, {
        ...base,
        relatedServicePageId: input.relatedServicePageId,
      });
  }
}
