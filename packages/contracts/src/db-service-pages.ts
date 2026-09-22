import { z } from "zod";

const timestamptzSchema = z.coerce.date();

export const servicePageTechCategorySchema = z.enum([
  "frontend",
  "backend",
  "mobile",
  "commerce",
  "database",
  "cloud",
]);

export const servicePageRowSchema = z.object({
  id: z.uuid(),
  parent_id: z.uuid().nullable(),
  sort_order: z.number().int(),
  slug: z.string(),
  title: z.string(),
  nav_label: z.string(),
  meta_title: z.string(),
  meta_description: z.string(),
  og_title: z.string(),
  og_description: z.string(),
  og_image_path: z.string(),
  hero_eyebrow: z.string(),
  hero_h1: z.string(),
  hero_description: z.string(),
  hero_primary_cta_label: z.string(),
  hero_primary_cta_href: z.string(),
  hero_secondary_cta_label: z.string(),
  hero_secondary_cta_href: z.string(),
  hero_image_path: z.string(),
  intro_heading: z.string(),
  intro_body: z.string(),
  offerings_heading: z.string(),
  build_heading: z.string(),
  process_heading: z.string(),
  technologies_heading: z.string(),
  benefits_heading: z.string(),
  benefits_intro: z.string(),
  capabilities_heading: z.string(),
  capabilities_intro: z.string(),
  problems_heading: z.string(),
  problems_intro: z.string(),
  comparison_heading: z.string(),
  comparison_body: z.string(),
  faqs_heading: z.string(),
  cta_heading: z.string(),
  cta_body: z.string(),
  cta_label: z.string(),
  cta_href: z.string(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

const titledChildRowSchema = z.object({
  id: z.uuid(),
  service_page_id: z.uuid(),
  title: z.string(),
  body: z.string(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const servicePageOfferingRowSchema = z.object({
  id: z.uuid(),
  service_page_id: z.uuid(),
  title: z.string(),
  description: z.string(),
  cta_label: z.string(),
  cta_href: z.string(),
  image_path: z.string(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const servicePageBuildItemRowSchema = z.object({
  id: z.uuid(),
  service_page_id: z.uuid(),
  label: z.string(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const servicePageProcessStepRowSchema = z.object({
  id: z.uuid(),
  service_page_id: z.uuid(),
  step_number: z.number().int(),
  title: z.string(),
  body: z.string(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const servicePageTechnologyRowSchema = z.object({
  id: z.uuid(),
  service_page_id: z.uuid(),
  category: servicePageTechCategorySchema,
  name: z.string(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const servicePageBenefitRowSchema = titledChildRowSchema;
export const servicePageCapabilityRowSchema = titledChildRowSchema;
export const servicePageProblemRowSchema = titledChildRowSchema;
export const servicePageComparisonPointRowSchema = titledChildRowSchema;

export const servicePageFaqRowSchema = z.object({
  id: z.uuid(),
  service_page_id: z.uuid(),
  question: z.string(),
  answer: z.string(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const servicePageRelatedRowSchema = z.object({
  id: z.uuid(),
  service_page_id: z.uuid(),
  related_service_page_id: z.uuid(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export type ServicePageTechCategory = z.infer<
  typeof servicePageTechCategorySchema
>;
export type ServicePageRow = z.infer<typeof servicePageRowSchema>;
export type ServicePageOfferingRow = z.infer<typeof servicePageOfferingRowSchema>;
export type ServicePageBuildItemRow = z.infer<
  typeof servicePageBuildItemRowSchema
>;
export type ServicePageProcessStepRow = z.infer<
  typeof servicePageProcessStepRowSchema
>;
export type ServicePageTechnologyRow = z.infer<
  typeof servicePageTechnologyRowSchema
>;
export type ServicePageBenefitRow = z.infer<typeof servicePageBenefitRowSchema>;
export type ServicePageCapabilityRow = z.infer<
  typeof servicePageCapabilityRowSchema
>;
export type ServicePageProblemRow = z.infer<typeof servicePageProblemRowSchema>;
export type ServicePageComparisonPointRow = z.infer<
  typeof servicePageComparisonPointRowSchema
>;
export type ServicePageFaqRow = z.infer<typeof servicePageFaqRowSchema>;
export type ServicePageRelatedRow = z.infer<typeof servicePageRelatedRowSchema>;
