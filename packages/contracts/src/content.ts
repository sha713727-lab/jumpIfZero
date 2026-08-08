import { z } from "zod";
import {
  blogPostListRowSchema,
  blogPostRowSchema,
  callbackRowSchema,
  contactMessageRowSchema,
  faqRowSchema,
  portfolioItemRowSchema,
  serviceRowSchema,
  siteGalleryImageRowSchema,
  siteGallerySectionKeySchema,
  sitePrincipleAccentSchema,
  sitePrincipleRowSchema,
  siteTestimonialAccentSchema,
  siteTestimonialRowSchema,
  teamMemberWithSocialsRowSchema,
} from "./db-content.ts";


export const sortDirSchema = z.enum(["asc", "desc"]);

const boolQuerySchema = z
  .union([z.boolean(), z.literal("true"), z.literal("false")])
  .transform((value) => value === true || value === "true");

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case");

const isoDateTimeNullableSchema = z.union([z.iso.datetime(), z.null()]);

export const contentListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  publishedOnly: boolQuerySchema.default(false),
  category: z.string().trim().max(128).optional(),
  sort: z
    .enum(["created_at", "updated_at", "title", "slug", "sort_order", "published_at"])
    .default("updated_at"),
  dir: sortDirSchema.default("desc"),
});

export const listQuerySchema = contentListQuerySchema;

export const contentListMetaSchema = z.object({
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const serviceCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  description: z.string().max(10000).default(""),
  path: z.string().trim().max(512).default(""),
  imagePath: z.string().trim().max(1024).default(""),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const serviceUpdateSchema = serviceCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const serviceArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const serviceRestoreSchema = serviceArchiveSchema;

export const portfolioItemCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  category: z.string().trim().max(128).default(""),
  summary: z.string().max(5000).default(""),
  imagePath: z.string().trim().max(1024).default(""),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const portfolioItemUpdateSchema = portfolioItemCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const portfolioItemArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const portfolioItemRestoreSchema = portfolioItemArchiveSchema;

export const blogPostCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  excerpt: z.string().max(2000).default(""),
  body: z.string().max(200000).default(""),
  imagePath: z.string().trim().max(1024).default(""),
  category: z.string().trim().max(128).default(""),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const blogPostUpdateSchema = blogPostCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const blogPostArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const blogPostRestoreSchema = blogPostArchiveSchema;

export const faqCreateSchema = z.object({
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(10000),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const faqUpdateSchema = faqCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const faqArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const faqRestoreSchema = faqArchiveSchema;

export const faqReorderItemSchema = z.object({
  id: z.uuid(),
  sortOrder: z.number().int(),
  version: z.number().int().min(1),
});

export const faqReorderSchema = z.object({
  items: z.array(faqReorderItemSchema).min(1).max(200),
});

export const teamMemberSocialInputSchema = z.object({
  network: z.enum(["linkedin", "instagram", "x"]),
  label: z.string().trim().min(1).max(64),
  href: z.string().trim().min(1).max(2048).pipe(z.url()),
});

export const teamMemberCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  roleTitle: z.string().trim().max(200).default(""),
  bio: z.string().max(10000).default(""),
  imagePath: z.string().trim().max(1024).default(""),
  employeeId: z.uuid().nullable().default(null),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
  socials: z.array(teamMemberSocialInputSchema).max(20).default([]),
});

export const teamMemberUpdateSchema = teamMemberCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const teamMemberArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const teamMemberRestoreSchema = teamMemberArchiveSchema;

export const teamMemberReorderItemSchema = z.object({
  id: z.uuid(),
  sortOrder: z.number().int(),
  version: z.number().int().min(1),
});

export const teamMemberReorderSchema = z.object({
  items: z.array(teamMemberReorderItemSchema).min(1).max(200),
});

export const cmsMediaUploadResponseSchema = z.object({
  imagePath: z.string().min(1).max(1024),
});

export const cmsMediaKeyQuerySchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(1024)
    .regex(/^cms\/[a-zA-Z0-9._-]+$/),
});

export const contactMessageCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().max(300).default(""),
  body: z.string().trim().min(1).max(20000),
});

export const contactMessageStatusSchema = z.enum(["new", "read"]);

export const contactMessagesListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  status: contactMessageStatusSchema.optional(),
  sort: z.enum(["created_at", "updated_at", "status_code"]).default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const contactMessageUpdateSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  status: contactMessageStatusSchema,
});

export const contactMessageArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const contactMessageRestoreSchema = contactMessageArchiveSchema;

export const callbackCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(64).default(""),
  note: z.string().trim().max(5000).default(""),
});

export const callbackStatusSchema = z.enum(["new", "resolved"]);

export const callbacksListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  status: callbackStatusSchema.optional(),
  sort: z.enum(["created_at", "updated_at", "status_code"]).default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const callbackUpdateSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  status: callbackStatusSchema,
});

export const callbackArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const callbackRestoreSchema = callbackArchiveSchema;

export const actorSchema = z.object({
  subjectId: z.uuid(),
  role: z.enum(["admin", "client", "employee"]),
  employeeKind: z.enum(["delivery", "sales"]).nullable(),
});

export const servicesListResponseSchema = z.object({
  items: z.array(serviceRowSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const portfolioListResponseSchema = z.object({
  items: z.array(portfolioItemRowSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const blogListResponseSchema = z.object({
  items: z.array(blogPostListRowSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const faqsListResponseSchema = z.object({
  items: z.array(faqRowSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const teamListResponseSchema = z.object({
  items: z.array(teamMemberWithSocialsRowSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const contactMessagesListResponseSchema = z.object({
  items: z.array(contactMessageRowSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const callbacksListResponseSchema = z.object({
  items: z.array(callbackRowSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const siteGalleryListQuerySchema = contentListQuerySchema.extend({
  sectionKey: siteGallerySectionKeySchema.optional(),
});

export const siteGalleryImageCreateSchema = z.object({
  sectionKey: siteGallerySectionKeySchema,
  imagePath: z.string().trim().min(1).max(1024),
  altText: z.string().trim().max(500).default(""),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const siteGalleryImageUpdateSchema = siteGalleryImageCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const siteGalleryImageArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const siteGalleryImageRestoreSchema = siteGalleryImageArchiveSchema;

export const siteGalleryImageReorderItemSchema = z.object({
  id: z.uuid(),
  sortOrder: z.number().int(),
  version: z.number().int().min(1),
});

export const siteGalleryImageReorderSchema = z.object({
  items: z.array(siteGalleryImageReorderItemSchema).min(1).max(200),
});

export const siteGalleryListResponseSchema = z.object({
  items: z.array(siteGalleryImageRowSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const siteTestimonialCreateSchema = z.object({
  quote: z.string().trim().min(1).max(2000),
  authorName: z.string().trim().min(1).max(200),
  roleTitle: z.string().trim().max(200).default(""),
  company: z.string().trim().max(200).default(""),
  accent: siteTestimonialAccentSchema.default("brand"),
  imagePath: z.string().trim().max(1024).default(""),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const siteTestimonialUpdateSchema = siteTestimonialCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const siteTestimonialArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const siteTestimonialRestoreSchema = siteTestimonialArchiveSchema;

export const siteTestimonialReorderItemSchema = z.object({
  id: z.uuid(),
  sortOrder: z.number().int(),
  version: z.number().int().min(1),
});

export const siteTestimonialReorderSchema = z.object({
  items: z.array(siteTestimonialReorderItemSchema).min(1).max(200),
});

export const siteTestimonialsListResponseSchema = z.object({
  items: z.array(siteTestimonialRowSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const sitePrincipleCreateSchema = z.object({
  indexLabel: z.string().trim().max(16).default(""),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(5000).default(""),
  accent: sitePrincipleAccentSchema.default("brand"),
  imagePath: z.string().trim().max(1024).default(""),
  imageAlt: z.string().trim().max(500).default(""),
  sortOrder: z.number().int().default(0),
  publishedAt: isoDateTimeNullableSchema.default(null),
});

export const sitePrincipleUpdateSchema = sitePrincipleCreateSchema.extend({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const sitePrincipleArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const sitePrincipleRestoreSchema = sitePrincipleArchiveSchema;

export const sitePrincipleReorderItemSchema = z.object({
  id: z.uuid(),
  sortOrder: z.number().int(),
  version: z.number().int().min(1),
});

export const sitePrincipleReorderSchema = z.object({
  items: z.array(sitePrincipleReorderItemSchema).min(1).max(200),
});

export const sitePrinciplesListResponseSchema = z.object({
  items: z.array(sitePrincipleRowSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const siteContactPublicSchema = z.object({
  id: z.uuid(),
  email: z.string().min(3).max(320),
  phone: z.string().min(1).max(64),
  phoneHref: z.string().max(128),
  addressLabel: z.string().max(200),
  addressLines: z.array(z.string().max(300)).max(3),
  locationLede: z.string().max(500),
  mapEmbedUrl: z.string().max(2000),
  version: z.number().int().min(1),
  updatedAt: z.iso.datetime(),
});

export const siteContactUpdateSchema = z.object({
  version: z.number().int().min(1),
  email: z.string().trim().min(3).max(320).pipe(z.email()),
  phone: z.string().trim().min(1).max(64),
  phoneHref: z.string().trim().max(128).default(""),
  addressLabel: z.string().trim().max(200).default(""),
  addressLine1: z.string().trim().max(300).default(""),
  addressLine2: z.string().trim().max(300).default(""),
  addressLine3: z.string().trim().max(300).default(""),
  locationLede: z.string().trim().max(500).default(""),
  mapEmbedUrl: z.string().trim().max(2000).default(""),
});

export type ContentListQuery = z.infer<typeof contentListQuerySchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
export type ServiceCreate = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdate = z.infer<typeof serviceUpdateSchema>;
export type ServiceArchive = z.infer<typeof serviceArchiveSchema>;
export type ServiceRestore = z.infer<typeof serviceRestoreSchema>;
export type PortfolioItemCreate = z.infer<typeof portfolioItemCreateSchema>;
export type PortfolioItemUpdate = z.infer<typeof portfolioItemUpdateSchema>;
export type PortfolioItemArchive = z.infer<typeof portfolioItemArchiveSchema>;
export type PortfolioItemRestore = z.infer<typeof portfolioItemRestoreSchema>;
export type BlogPostCreate = z.infer<typeof blogPostCreateSchema>;
export type BlogPostUpdate = z.infer<typeof blogPostUpdateSchema>;
export type BlogPostArchive = z.infer<typeof blogPostArchiveSchema>;
export type BlogPostRestore = z.infer<typeof blogPostRestoreSchema>;
export type FaqCreate = z.infer<typeof faqCreateSchema>;
export type FaqUpdate = z.infer<typeof faqUpdateSchema>;
export type FaqArchive = z.infer<typeof faqArchiveSchema>;
export type FaqRestore = z.infer<typeof faqRestoreSchema>;
export type FaqReorder = z.infer<typeof faqReorderSchema>;
export type TeamMemberCreate = z.infer<typeof teamMemberCreateSchema>;
export type TeamMemberUpdate = z.infer<typeof teamMemberUpdateSchema>;
export type TeamMemberArchive = z.infer<typeof teamMemberArchiveSchema>;
export type TeamMemberRestore = z.infer<typeof teamMemberRestoreSchema>;
export type TeamMemberReorder = z.infer<typeof teamMemberReorderSchema>;
export type ContactMessageCreate = z.infer<typeof contactMessageCreateSchema>;
export type ContactMessageUpdate = z.infer<typeof contactMessageUpdateSchema>;
export type CallbackCreate = z.infer<typeof callbackCreateSchema>;
export type CallbackUpdate = z.infer<typeof callbackUpdateSchema>;
export type SiteGalleryListQuery = z.infer<typeof siteGalleryListQuerySchema>;
export type SiteGalleryImageCreate = z.infer<typeof siteGalleryImageCreateSchema>;
export type SiteGalleryImageUpdate = z.infer<typeof siteGalleryImageUpdateSchema>;
export type SiteGalleryImageArchive = z.infer<
  typeof siteGalleryImageArchiveSchema
>;
export type SiteGalleryImageRestore = z.infer<
  typeof siteGalleryImageRestoreSchema
>;
export type SiteGalleryImageReorder = z.infer<
  typeof siteGalleryImageReorderSchema
>;
export type SiteTestimonialCreate = z.infer<typeof siteTestimonialCreateSchema>;
export type SiteTestimonialUpdate = z.infer<typeof siteTestimonialUpdateSchema>;
export type SiteTestimonialArchive = z.infer<
  typeof siteTestimonialArchiveSchema
>;
export type SiteTestimonialRestore = z.infer<
  typeof siteTestimonialRestoreSchema
>;
export type SiteTestimonialReorder = z.infer<
  typeof siteTestimonialReorderSchema
>;
export type SitePrincipleCreate = z.infer<typeof sitePrincipleCreateSchema>;
export type SitePrincipleUpdate = z.infer<typeof sitePrincipleUpdateSchema>;
export type SitePrincipleArchive = z.infer<typeof sitePrincipleArchiveSchema>;
export type SitePrincipleRestore = z.infer<typeof sitePrincipleRestoreSchema>;
export type SitePrincipleReorder = z.infer<typeof sitePrincipleReorderSchema>;
export type SiteContactPublic = z.infer<typeof siteContactPublicSchema>;
export type SiteContactUpdate = z.infer<typeof siteContactUpdateSchema>;
export type Actor = z.infer<typeof actorSchema>;
export type BlogPostDetail = z.infer<typeof blogPostRowSchema>;
export type ContactMessageRowPublic = z.infer<typeof contactMessageRowSchema>;
export type CallbackRowPublic = z.infer<typeof callbackRowSchema>;
