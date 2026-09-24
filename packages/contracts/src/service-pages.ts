import { z } from "zod";
import {
  servicePageBenefitRowSchema,
  servicePageBuildItemRowSchema,
  servicePageCapabilityRowSchema,
  servicePageComparisonPointRowSchema,
  servicePageFaqRowSchema,
  servicePageOfferingRowSchema,
  servicePageProblemRowSchema,
  servicePageProcessStepRowSchema,
  servicePageRelatedRowSchema,
  servicePageRowSchema,
  servicePageTechCategorySchema,
  servicePageTechnologyRowSchema,
} from "./db-service-pages.ts";
import { slugSchema } from "./content.ts";

const isoDateTimeNullableSchema = z.union([z.iso.datetime(), z.null()]);

const hrefSchema = z
  .string()
  .trim()
  .max(512)
  .refine(
    (value) =>
      value.length === 0 ||
      value.startsWith("/") ||
      value.startsWith("#") ||
      /^https?:\/\//i.test(value) ||
      /^mailto:/i.test(value),
    {
      message:
        "Must be empty, a site path, a hash link, mailto, or an http(s) URL",
    },
  );

export const servicePageUpdateSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  title: z.string().trim().min(1).max(200),
  navLabel: z.string().trim().max(100).default(""),
  metaTitle: z.string().trim().max(200).default(""),
  metaDescription: z.string().trim().max(500).default(""),
  ogTitle: z.string().trim().max(200).default(""),
  ogDescription: z.string().trim().max(500).default(""),
  ogImagePath: z.string().trim().max(1024).default(""),
  heroEyebrow: z.string().trim().max(100).default(""),
  heroH1: z.string().trim().min(1).max(300),
  heroDescription: z.string().trim().max(2000).default(""),
  heroPrimaryCtaLabel: z.string().trim().max(100).default(""),
  heroPrimaryCtaHref: hrefSchema.default(""),
  heroSecondaryCtaLabel: z.string().trim().max(100).default(""),
  heroSecondaryCtaHref: hrefSchema.default(""),
  heroImagePath: z.string().trim().max(1024).default(""),
  introHeading: z.string().trim().max(200).default(""),
  introBody: z.string().trim().max(10000).default(""),
  offeringsHeading: z.string().trim().max(200).default(""),
  buildHeading: z.string().trim().max(200).default(""),
  processHeading: z.string().trim().max(200).default(""),
  technologiesHeading: z.string().trim().max(200).default(""),
  benefitsHeading: z.string().trim().max(200).default(""),
  benefitsIntro: z.string().trim().max(2000).default(""),
  capabilitiesHeading: z.string().trim().max(200).default(""),
  capabilitiesIntro: z.string().trim().max(2000).default(""),
  problemsHeading: z.string().trim().max(200).default(""),
  problemsIntro: z.string().trim().max(2000).default(""),
  comparisonHeading: z.string().trim().max(200).default(""),
  comparisonBody: z.string().trim().max(10000).default(""),
  faqsHeading: z.string().trim().max(200).default(""),
  ctaHeading: z.string().trim().max(300).default(""),
  ctaBody: z.string().trim().max(2000).default(""),
  ctaLabel: z.string().trim().max(100).default(""),
  ctaHref: hrefSchema.default(""),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const servicePageArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const servicePageRestoreSchema = servicePageArchiveSchema;

export const servicePageOfferingCreateSchema = z.object({
  servicePageId: z.uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).default(""),
  ctaLabel: z.string().trim().max(100).default(""),
  ctaHref: hrefSchema.default(""),
  imagePath: z.string().trim().max(1024).default(""),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const servicePageOfferingUpdateSchema =
  servicePageOfferingCreateSchema.extend({
    id: z.uuid(),
    version: z.number().int().min(1),
  });

export const servicePageBuildItemCreateSchema = z.object({
  servicePageId: z.uuid(),
  label: z.string().trim().min(1).max(200),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const servicePageBuildItemUpdateSchema =
  servicePageBuildItemCreateSchema.extend({
    id: z.uuid(),
    version: z.number().int().min(1),
  });

export const servicePageProcessStepCreateSchema = z.object({
  servicePageId: z.uuid(),
  stepNumber: z.number().int().min(1).max(99).default(1),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(5000).default(""),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const servicePageProcessStepUpdateSchema =
  servicePageProcessStepCreateSchema.extend({
    id: z.uuid(),
    version: z.number().int().min(1),
  });

export const servicePageTechnologyCreateSchema = z.object({
  servicePageId: z.uuid(),
  category: servicePageTechCategorySchema,
  name: z.string().trim().min(1).max(100),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const servicePageTechnologyUpdateSchema =
  servicePageTechnologyCreateSchema.extend({
    id: z.uuid(),
    version: z.number().int().min(1),
  });

const titledChildCreateSchema = z.object({
  servicePageId: z.uuid(),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(5000).default(""),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const servicePageBenefitCreateSchema = titledChildCreateSchema;
export const servicePageBenefitUpdateSchema = titledChildCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const servicePageCapabilityCreateSchema = titledChildCreateSchema;
export const servicePageCapabilityUpdateSchema = titledChildCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const servicePageProblemCreateSchema = titledChildCreateSchema;
export const servicePageProblemUpdateSchema = titledChildCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const servicePageComparisonPointCreateSchema = titledChildCreateSchema;
export const servicePageComparisonPointUpdateSchema =
  titledChildCreateSchema.extend({
    id: z.uuid(),
    version: z.number().int().min(1),
  });

export const servicePageFaqCreateSchema = z.object({
  servicePageId: z.uuid(),
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(10000),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const servicePageFaqUpdateSchema = servicePageFaqCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const servicePageRelatedCreateSchema = z.object({
  servicePageId: z.uuid(),
  relatedServicePageId: z.uuid(),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const servicePageRelatedUpdateSchema =
  servicePageRelatedCreateSchema.extend({
    id: z.uuid(),
    version: z.number().int().min(1),
  });

export const servicePageChildArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const servicePageChildRestoreSchema = servicePageChildArchiveSchema;

export const servicePageChildReorderItemSchema = z.object({
  id: z.uuid(),
  sortOrder: z.number().int(),
  version: z.number().int().min(1),
});

export const servicePageChildReorderSchema = z.object({
  servicePageId: z.uuid(),
  items: z.array(servicePageChildReorderItemSchema).min(1).max(200),
});

export const servicePageListItemSchema = z.object({
  id: z.uuid(),
  slug: slugSchema,
  title: z.string(),
  navLabel: z.string(),
  parentId: z.uuid().nullable(),
  sortOrder: z.number().int(),
  publishedAt: z.iso.datetime().nullable(),
  version: z.number().int().min(1),
  updatedAt: z.iso.datetime(),
});

export const servicePagesListResponseSchema = z.object({
  items: z.array(servicePageListItemSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const servicePageChildSummarySchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  title: z.string(),
  navLabel: z.string(),
  heroDescription: z.string(),
  heroImagePath: z.string(),
  sortOrder: z.number().int(),
  href: z.string(),
});

export const servicePageRelatedSummarySchema = z.object({
  id: z.uuid(),
  sortOrder: z.number().int(),
  page: servicePageChildSummarySchema,
});

export const servicePageParentSummarySchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  title: z.string(),
  navLabel: z.string(),
  href: z.string(),
});

export const servicePageDetailSchema = z.object({
  id: z.uuid(),
  parentId: z.uuid().nullable(),
  sortOrder: z.number().int(),
  slug: z.string(),
  title: z.string(),
  navLabel: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  ogTitle: z.string(),
  ogDescription: z.string(),
  ogImagePath: z.string(),
  heroEyebrow: z.string(),
  heroH1: z.string(),
  heroDescription: z.string(),
  heroPrimaryCtaLabel: z.string(),
  heroPrimaryCtaHref: z.string(),
  heroSecondaryCtaLabel: z.string(),
  heroSecondaryCtaHref: z.string(),
  heroImagePath: z.string(),
  introHeading: z.string(),
  introBody: z.string(),
  offeringsHeading: z.string(),
  buildHeading: z.string(),
  processHeading: z.string(),
  technologiesHeading: z.string(),
  benefitsHeading: z.string(),
  benefitsIntro: z.string(),
  capabilitiesHeading: z.string(),
  capabilitiesIntro: z.string(),
  problemsHeading: z.string(),
  problemsIntro: z.string(),
  comparisonHeading: z.string(),
  comparisonBody: z.string(),
  faqsHeading: z.string(),
  ctaHeading: z.string(),
  ctaBody: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
  href: z.string(),
  publishedAt: z.iso.datetime().nullable(),
  version: z.number().int().min(1),
  updatedAt: z.iso.datetime(),
  parent: servicePageParentSummarySchema.nullable(),
  children: z.array(servicePageChildSummarySchema),
  offerings: z.array(servicePageOfferingRowSchema),
  buildItems: z.array(servicePageBuildItemRowSchema),
  processSteps: z.array(servicePageProcessStepRowSchema),
  technologies: z.array(servicePageTechnologyRowSchema),
  benefits: z.array(servicePageBenefitRowSchema),
  capabilities: z.array(servicePageCapabilityRowSchema),
  problems: z.array(servicePageProblemRowSchema),
  comparisonPoints: z.array(servicePageComparisonPointRowSchema),
  faqs: z.array(servicePageFaqRowSchema),
  related: z.array(servicePageRelatedSummarySchema),
});

export type ServicePageUpdate = z.infer<typeof servicePageUpdateSchema>;
export type ServicePageDetail = z.infer<typeof servicePageDetailSchema>;
export type ServicePageListItem = z.infer<typeof servicePageListItemSchema>;

export {
  servicePageRowSchema,
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
  servicePageTechCategorySchema,
};
