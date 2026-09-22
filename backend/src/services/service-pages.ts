import {
  listQuerySchema,
  servicePageArchiveSchema,
  servicePageBenefitCreateSchema,
  servicePageBenefitUpdateSchema,
  servicePageBuildItemCreateSchema,
  servicePageBuildItemUpdateSchema,
  servicePageCapabilityCreateSchema,
  servicePageCapabilityUpdateSchema,
  servicePageChildArchiveSchema,
  servicePageChildReorderSchema,
  servicePageChildRestoreSchema,
  servicePageComparisonPointCreateSchema,
  servicePageComparisonPointUpdateSchema,
  servicePageDetailSchema,
  servicePageFaqCreateSchema,
  servicePageFaqUpdateSchema,
  servicePageOfferingCreateSchema,
  servicePageOfferingUpdateSchema,
  servicePageProblemCreateSchema,
  servicePageProblemUpdateSchema,
  servicePageProcessStepCreateSchema,
  servicePageProcessStepUpdateSchema,
  servicePageRelatedCreateSchema,
  servicePageRelatedUpdateSchema,
  servicePageRestoreSchema,
  servicePageTechnologyCreateSchema,
  servicePageTechnologyUpdateSchema,
  servicePageUpdateSchema,
  servicePagesListResponseSchema,
  type Actor,
  type ServicePageDetail,
  type ServicePageRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { NotFoundError } from "../lib/errors.ts";
import { withTransaction } from "../db/transaction.ts";
import * as servicePagesRepo from "../repositories/service-pages.ts";
import {
  servicePageCollectionSchema,
  type ServicePageChildRow,
  type ServicePageCollection,
} from "../repositories/service-pages.ts";
import {
  parseInput,
  requireAdmin,
  resolveVersionWrite,
  toDateOrNull,
} from "./_helpers.ts";

export { servicePageCollectionSchema };
export type { ServicePageChildRow, ServicePageCollection };

function toIso(value: Date): string {
  return value.toISOString();
}

function toIsoOrNull(value: Date | null): string | null {
  if (value === null) {
    return null;
  }
  return value.toISOString();
}

function pageHref(slug: string, parentSlug: string | null): string {
  if (parentSlug === null) {
    return `/services/${slug}`;
  }
  return `/services/${parentSlug}/${slug}`;
}

function toChildSummary(row: ServicePageRow, parentSlug: string): {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly navLabel: string;
  readonly heroDescription: string;
  readonly heroImagePath: string;
  readonly sortOrder: number;
  readonly href: string;
} {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    navLabel: row.nav_label,
    heroDescription: row.hero_description,
    heroImagePath: row.hero_image_path,
    sortOrder: row.sort_order,
    href: pageHref(row.slug, parentSlug),
  };
}

function assertPublished(
  row: ServicePageRow,
  publishedOnly: boolean,
): ServicePageRow {
  if (publishedOnly && row.published_at === null) {
    throw new NotFoundError("Service page not found");
  }
  return row;
}

function parseCollection(collection: unknown): ServicePageCollection {
  return parseInput(servicePageCollectionSchema, collection);
}

async function toDetail(
  row: ServicePageRow,
  publishedOnly: boolean,
): Promise<ServicePageDetail> {
  const parentPromise =
    row.parent_id === null
      ? Promise.resolve(null)
      : servicePagesRepo.getActiveById(row.parent_id);

  const [
    parentRow,
    childPages,
    offerings,
    buildItems,
    processSteps,
    technologies,
    benefits,
    capabilities,
    problems,
    comparisonPoints,
    faqs,
    related,
  ] = await Promise.all([
    parentPromise,
    servicePagesRepo.listChildPagesByParentId(row.id, publishedOnly),
    servicePagesRepo.listChildrenByPageId("offerings", row.id, publishedOnly),
    servicePagesRepo.listChildrenByPageId("build-items", row.id, publishedOnly),
    servicePagesRepo.listChildrenByPageId(
      "process-steps",
      row.id,
      publishedOnly,
    ),
    servicePagesRepo.listChildrenByPageId(
      "technologies",
      row.id,
      publishedOnly,
    ),
    servicePagesRepo.listChildrenByPageId("benefits", row.id, publishedOnly),
    servicePagesRepo.listChildrenByPageId(
      "capabilities",
      row.id,
      publishedOnly,
    ),
    servicePagesRepo.listChildrenByPageId("problems", row.id, publishedOnly),
    servicePagesRepo.listChildrenByPageId(
      "comparison-points",
      row.id,
      publishedOnly,
    ),
    servicePagesRepo.listChildrenByPageId("faqs", row.id, publishedOnly),
    servicePagesRepo.listRelatedSummaries(row.id, publishedOnly),
  ]);

  const parentSlug = parentRow?.slug ?? null;
  const parent =
    parentRow === null
      ? null
      : {
          id: parentRow.id,
          slug: parentRow.slug,
          title: parentRow.title,
          navLabel: parentRow.nav_label,
          href: pageHref(parentRow.slug, null),
        };

  return servicePageDetailSchema.parse({
    id: row.id,
    parentId: row.parent_id,
    sortOrder: row.sort_order,
    slug: row.slug,
    title: row.title,
    navLabel: row.nav_label,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    ogTitle: row.og_title,
    ogDescription: row.og_description,
    ogImagePath: row.og_image_path,
    heroEyebrow: row.hero_eyebrow,
    heroH1: row.hero_h1,
    heroDescription: row.hero_description,
    heroPrimaryCtaLabel: row.hero_primary_cta_label,
    heroPrimaryCtaHref: row.hero_primary_cta_href,
    heroSecondaryCtaLabel: row.hero_secondary_cta_label,
    heroSecondaryCtaHref: row.hero_secondary_cta_href,
    heroImagePath: row.hero_image_path,
    introHeading: row.intro_heading,
    introBody: row.intro_body,
    offeringsHeading: row.offerings_heading,
    buildHeading: row.build_heading,
    processHeading: row.process_heading,
    technologiesHeading: row.technologies_heading,
    benefitsHeading: row.benefits_heading,
    benefitsIntro: row.benefits_intro,
    capabilitiesHeading: row.capabilities_heading,
    capabilitiesIntro: row.capabilities_intro,
    problemsHeading: row.problems_heading,
    problemsIntro: row.problems_intro,
    comparisonHeading: row.comparison_heading,
    comparisonBody: row.comparison_body,
    faqsHeading: row.faqs_heading,
    ctaHeading: row.cta_heading,
    ctaBody: row.cta_body,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    href: pageHref(row.slug, parentSlug),
    publishedAt: toIsoOrNull(row.published_at),
    version: row.version,
    updatedAt: toIso(row.updated_at),
    parent,
    children: childPages.map((child) => toChildSummary(child, row.slug)),
    offerings,
    buildItems,
    processSteps,
    technologies,
    benefits,
    capabilities,
    problems,
    comparisonPoints,
    faqs,
    related,
  });
}

async function requireActivePage(pageId: string): Promise<ServicePageRow> {
  const page = await servicePagesRepo.getActiveById(pageId);
  if (page === null) {
    throw new NotFoundError("Service page not found");
  }
  return page;
}

export async function listServicePages(
  input: unknown,
  publishedOnly: boolean,
): Promise<unknown> {
  const query = parseInput(listQuerySchema, input);
  const sort =
    query.sort === "sort_order"
      ? "updated_at"
      : query.sort === "title" ||
          query.sort === "slug" ||
          query.sort === "created_at" ||
          query.sort === "published_at"
        ? query.sort
        : "updated_at";
  const result = await servicePagesRepo.listActiveServicePages({
    limit: query.limit,
    offset: query.offset,
    publishedOnly,
    sort,
    dir: query.dir,
    ...(query.q !== undefined ? { q: query.q } : {}),
  });
  return servicePagesListResponseSchema.parse({
    items: result.items.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      navLabel: row.nav_label,
      parentId: row.parent_id,
      sortOrder: row.sort_order,
      publishedAt: toIsoOrNull(row.published_at),
      version: row.version,
      updatedAt: toIso(row.updated_at),
    })),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getServicePageBySlug(
  slug: string,
  publishedOnly: boolean,
): Promise<ServicePageDetail> {
  const row = await servicePagesRepo.getActiveBySlug(slug);
  if (row === null) {
    throw new NotFoundError("Service page not found");
  }
  return toDetail(assertPublished(row, publishedOnly), publishedOnly);
}

export async function getServicePageByPath(
  pillarSlug: string,
  childSlug: string,
  publishedOnly: boolean,
): Promise<ServicePageDetail> {
  const row = await servicePagesRepo.getByParentSlugAndChildSlug(
    pillarSlug,
    childSlug,
  );
  if (row === null) {
    throw new NotFoundError("Service page not found");
  }
  return toDetail(assertPublished(row, publishedOnly), publishedOnly);
}

export async function getServicePageById(
  id: string,
  publishedOnly: boolean,
): Promise<ServicePageDetail> {
  const row = await servicePagesRepo.getActiveById(id);
  if (row === null) {
    throw new NotFoundError("Service page not found");
  }
  return toDetail(assertPublished(row, publishedOnly), publishedOnly);
}

export async function updateServicePage(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<ServicePageDetail> {
  requireAdmin(actor);
  const body = parseInput(servicePageUpdateSchema, input);
  const updated = await servicePagesRepo.updateServicePage({
    id: body.id,
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
    publishedAt: toDateOrNull(body.publishedAt),
  });

  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => servicePagesRepo.getServicePageByIdFromBase(body.id),
    notFoundMessage: "Service page not found",
    conflictMessage: "Service page version conflict",
  });
  audit({
    action: "content.service_pages.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.service-pages.update",
  });
  return toDetail(row, false);
}

export async function archiveServicePage(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(servicePageArchiveSchema, input);
  const archived = await servicePagesRepo.archiveServicePage({
    id: body.id,
    version: body.version,
  });

  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () => servicePagesRepo.getServicePageByIdFromBase(body.id),
    notFoundMessage: "Service page not found",
    conflictMessage: "Service page version conflict",
  });
  audit({
    action: "content.service_pages.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.service-pages.archive",
  });
}

export async function restoreServicePage(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<ServicePageDetail> {
  requireAdmin(actor);
  const body = parseInput(servicePageRestoreSchema, input);
  const restored = await servicePagesRepo.restoreServicePage({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => servicePagesRepo.getServicePageByIdFromBase(body.id),
    notFoundMessage: "Service page not found",
    conflictMessage: "Service page version conflict",
  });
  audit({
    action: "content.service_pages.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.service-pages.restore",
  });
  return toDetail(row, false);
}

export async function createChild(
  actor: Actor,
  collectionInput: unknown,
  servicePageId: string,
  input: unknown,
  correlationId: string,
): Promise<ServicePageChildRow> {
  requireAdmin(actor);
  const collection = parseCollection(collectionInput);
  await requireActivePage(servicePageId);

  let row: ServicePageChildRow;
  switch (collection) {
    case "offerings": {
      const body = parseInput(servicePageOfferingCreateSchema, input);
      row = await servicePagesRepo.insertOffering({
        servicePageId: body.servicePageId,
        title: body.title,
        description: body.description,
        ctaLabel: body.ctaLabel,
        ctaHref: body.ctaHref,
        imagePath: body.imagePath,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "build-items": {
      const body = parseInput(servicePageBuildItemCreateSchema, input);
      row = await servicePagesRepo.insertBuildItem({
        servicePageId: body.servicePageId,
        label: body.label,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "process-steps": {
      const body = parseInput(servicePageProcessStepCreateSchema, input);
      row = await servicePagesRepo.insertProcessStep({
        servicePageId: body.servicePageId,
        stepNumber: body.stepNumber,
        title: body.title,
        body: body.body,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "technologies": {
      const body = parseInput(servicePageTechnologyCreateSchema, input);
      row = await servicePagesRepo.insertTechnology({
        servicePageId: body.servicePageId,
        category: body.category,
        name: body.name,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "benefits": {
      const body = parseInput(servicePageBenefitCreateSchema, input);
      row = await servicePagesRepo.insertBenefit({
        servicePageId: body.servicePageId,
        title: body.title,
        body: body.body,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "capabilities": {
      const body = parseInput(servicePageCapabilityCreateSchema, input);
      row = await servicePagesRepo.insertCapability({
        servicePageId: body.servicePageId,
        title: body.title,
        body: body.body,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "problems": {
      const body = parseInput(servicePageProblemCreateSchema, input);
      row = await servicePagesRepo.insertProblem({
        servicePageId: body.servicePageId,
        title: body.title,
        body: body.body,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "comparison-points": {
      const body = parseInput(servicePageComparisonPointCreateSchema, input);
      row = await servicePagesRepo.insertComparisonPoint({
        servicePageId: body.servicePageId,
        title: body.title,
        body: body.body,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "faqs": {
      const body = parseInput(servicePageFaqCreateSchema, input);
      row = await servicePagesRepo.insertFaq({
        servicePageId: body.servicePageId,
        question: body.question,
        answer: body.answer,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "related": {
      const body = parseInput(servicePageRelatedCreateSchema, input);
      row = await servicePagesRepo.insertRelated({
        servicePageId: body.servicePageId,
        relatedServicePageId: body.relatedServicePageId,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
  }

  audit({
    action: `content.service_pages.${collection}.create`,
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.service-pages.child.create",
  });
  return row;
}

export async function updateChild(
  actor: Actor,
  collectionInput: unknown,
  servicePageId: string,
  childId: string,
  input: unknown,
  correlationId: string,
): Promise<ServicePageChildRow> {
  requireAdmin(actor);
  const collection = parseCollection(collectionInput);
  await requireActivePage(servicePageId);

  let updated: ServicePageChildRow | null;
  switch (collection) {
    case "offerings": {
      const body = parseInput(servicePageOfferingUpdateSchema, input);
      updated = await servicePagesRepo.updateOffering({
        id: body.id,
        servicePageId: body.servicePageId,
        version: body.version,
        title: body.title,
        description: body.description,
        ctaLabel: body.ctaLabel,
        ctaHref: body.ctaHref,
        imagePath: body.imagePath,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "build-items": {
      const body = parseInput(servicePageBuildItemUpdateSchema, input);
      updated = await servicePagesRepo.updateBuildItem({
        id: body.id,
        servicePageId: body.servicePageId,
        version: body.version,
        label: body.label,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "process-steps": {
      const body = parseInput(servicePageProcessStepUpdateSchema, input);
      updated = await servicePagesRepo.updateProcessStep({
        id: body.id,
        servicePageId: body.servicePageId,
        version: body.version,
        stepNumber: body.stepNumber,
        title: body.title,
        body: body.body,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "technologies": {
      const body = parseInput(servicePageTechnologyUpdateSchema, input);
      updated = await servicePagesRepo.updateTechnology({
        id: body.id,
        servicePageId: body.servicePageId,
        version: body.version,
        category: body.category,
        name: body.name,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "benefits": {
      const body = parseInput(servicePageBenefitUpdateSchema, input);
      updated = await servicePagesRepo.updateBenefit({
        id: body.id,
        servicePageId: body.servicePageId,
        version: body.version,
        title: body.title,
        body: body.body,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "capabilities": {
      const body = parseInput(servicePageCapabilityUpdateSchema, input);
      updated = await servicePagesRepo.updateCapability({
        id: body.id,
        servicePageId: body.servicePageId,
        version: body.version,
        title: body.title,
        body: body.body,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "problems": {
      const body = parseInput(servicePageProblemUpdateSchema, input);
      updated = await servicePagesRepo.updateProblem({
        id: body.id,
        servicePageId: body.servicePageId,
        version: body.version,
        title: body.title,
        body: body.body,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "comparison-points": {
      const body = parseInput(servicePageComparisonPointUpdateSchema, input);
      updated = await servicePagesRepo.updateComparisonPoint({
        id: body.id,
        servicePageId: body.servicePageId,
        version: body.version,
        title: body.title,
        body: body.body,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "faqs": {
      const body = parseInput(servicePageFaqUpdateSchema, input);
      updated = await servicePagesRepo.updateFaq({
        id: body.id,
        servicePageId: body.servicePageId,
        version: body.version,
        question: body.question,
        answer: body.answer,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
    case "related": {
      const body = parseInput(servicePageRelatedUpdateSchema, input);
      updated = await servicePagesRepo.updateRelated({
        id: body.id,
        servicePageId: body.servicePageId,
        version: body.version,
        relatedServicePageId: body.relatedServicePageId,
        sortOrder: body.sortOrder,
        publishedAt: toDateOrNull(body.publishedAt),
      });
      break;
    }
  }

  const row = await resolveVersionWrite({
    result: updated,
    lookup: () =>
      servicePagesRepo.getChildByIdFromBase(collection, childId, servicePageId),
    notFoundMessage: "Service page child not found",
    conflictMessage: "Service page child version conflict",
  });
  audit({
    action: `content.service_pages.${collection}.update`,
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.service-pages.child.update",
  });
  return row;
}

export async function archiveChild(
  actor: Actor,
  collectionInput: unknown,
  servicePageId: string,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const collection = parseCollection(collectionInput);
  await requireActivePage(servicePageId);
  const body = parseInput(servicePageChildArchiveSchema, input);
  const archived = await servicePagesRepo.archiveChild(collection, {
    id: body.id,
    servicePageId,
    version: body.version,
  });

  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () =>
      servicePagesRepo.getChildByIdFromBase(collection, body.id, servicePageId),
    notFoundMessage: "Service page child not found",
    conflictMessage: "Service page child version conflict",
  });
  audit({
    action: `content.service_pages.${collection}.archive`,
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.service-pages.child.archive",
  });
}

export async function restoreChild(
  actor: Actor,
  collectionInput: unknown,
  servicePageId: string,
  input: unknown,
  correlationId: string,
): Promise<ServicePageChildRow> {
  requireAdmin(actor);
  const collection = parseCollection(collectionInput);
  await requireActivePage(servicePageId);
  const body = parseInput(servicePageChildRestoreSchema, input);
  const restored = await servicePagesRepo.restoreChild(collection, {
    id: body.id,
    servicePageId,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () =>
      servicePagesRepo.getChildByIdFromBase(collection, body.id, servicePageId),
    notFoundMessage: "Service page child not found",
    conflictMessage: "Service page child version conflict",
  });
  audit({
    action: `content.service_pages.${collection}.restore`,
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.service-pages.child.restore",
  });
  return row;
}

export async function reorderChildren(
  actor: Actor,
  collectionInput: unknown,
  servicePageId: string,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const collection = parseCollection(collectionInput);
  await requireActivePage(servicePageId);
  const body = parseInput(servicePageChildReorderSchema, input);
  const first = body.items[0];
  if (first === undefined) {
    return;
  }

  const reordered = await withTransaction((client) =>
    servicePagesRepo.reorderChildren(
      collection,
      servicePageId,
      body.items.map((item) => ({
        id: item.id,
        sortOrder: item.sortOrder,
        version: item.version,
      })),
      client,
    ),
  );

  await resolveVersionWrite({
    result: reordered ? true : null,
    lookup: () =>
      servicePagesRepo.getChildByIdFromBase(
        collection,
        first.id,
        servicePageId,
      ),
    notFoundMessage: "Service page child not found",
    conflictMessage: "Service page child version conflict",
  });
  audit({
    action: `content.service_pages.${collection}.reorder`,
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.service-pages.child.reorder",
  });
}
