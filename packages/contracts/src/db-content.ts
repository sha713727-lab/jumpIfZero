import { z } from "zod";

const timestamptzSchema = z.coerce.date();

export const serviceRowSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  path: z.string(),
  image_path: z.string(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const serviceListRowSchema = serviceRowSchema;

export const portfolioItemRowSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  category: z.string(),
  summary: z.string(),
  image_path: z.string(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const blogPostListRowSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  image_path: z.string(),
  category: z.string(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const blogPostRowSchema = blogPostListRowSchema.extend({
  body: z.string(),
});

export const faqRowSchema = z.object({
  id: z.uuid(),
  question: z.string(),
  answer: z.string(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const teamMemberSocialRowSchema = z.object({
  id: z.uuid(),
  team_member_id: z.uuid(),
  network: z.enum(["linkedin", "instagram", "x"]),
  label: z.string(),
  href: z.string(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const teamMemberRowSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  role_title: z.string(),
  bio: z.string(),
  image_path: z.string(),
  employee_id: z.uuid().nullable(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const teamMemberWithSocialsRowSchema = teamMemberRowSchema.extend({
  socials: z.array(teamMemberSocialRowSchema),
});

export const contactMessageRowSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  subject: z.string(),
  body: z.string(),
  status_code: z.enum(["new", "read"]),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
  archived_at: timestamptzSchema.nullable(),
});

export const callbackRowSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  note: z.string(),
  status_code: z.enum(["new", "resolved"]),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
  archived_at: timestamptzSchema.nullable(),
});

export const siteGallerySectionKeySchema = z.enum([
  "about_gallery",
  "studio_flow",
]);

export const siteGalleryImageRowSchema = z.object({
  id: z.uuid(),
  section_key: siteGallerySectionKeySchema,
  image_path: z.string(),
  alt_text: z.string(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const siteTestimonialAccentSchema = z.enum([
  "brand",
  "secondary",
  "dark",
]);

export const siteTestimonialRowSchema = z.object({
  id: z.uuid(),
  quote: z.string(),
  author_name: z.string(),
  role_title: z.string(),
  company: z.string(),
  accent: siteTestimonialAccentSchema,
  image_path: z.string(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const sitePrincipleAccentSchema = z.enum(["brand", "secondary"]);

export const sitePrincipleRowSchema = z.object({
  id: z.uuid(),
  index_label: z.string(),
  title: z.string(),
  body: z.string(),
  accent: sitePrincipleAccentSchema,
  image_path: z.string(),
  image_alt: z.string(),
  sort_order: z.number().int(),
  published_at: timestamptzSchema.nullable(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const siteContactRowSchema = z.object({
  id: z.uuid(),
  singleton_key: z.literal("default"),
  email: z.string(),
  phone: z.string(),
  phone_href: z.string(),
  address_label: z.string(),
  address_line_1: z.string(),
  address_line_2: z.string(),
  address_line_3: z.string(),
  location_lede: z.string(),
  map_embed_url: z.string(),
  social_linkedin_url: z.string(),
  social_instagram_url: z.string(),
  social_facebook_url: z.string(),
  social_x_url: z.string(),
  version: z.number().int(),
  created_at: timestamptzSchema,
  updated_at: timestamptzSchema,
});

export const schemaMigrationRowSchema = z.object({
  version: z.string(),
  checksum: z.string(),
  applied_at: timestamptzSchema,
});

export type ServiceRow = z.infer<typeof serviceRowSchema>;
export type PortfolioItemRow = z.infer<typeof portfolioItemRowSchema>;
export type BlogPostListRow = z.infer<typeof blogPostListRowSchema>;
export type BlogPostRow = z.infer<typeof blogPostRowSchema>;
export type FaqRow = z.infer<typeof faqRowSchema>;
export type TeamMemberSocialRow = z.infer<typeof teamMemberSocialRowSchema>;
export type TeamMemberRow = z.infer<typeof teamMemberRowSchema>;
export type TeamMemberWithSocialsRow = z.infer<
  typeof teamMemberWithSocialsRowSchema
>;
export type ContactMessageRow = z.infer<typeof contactMessageRowSchema>;
export type CallbackRow = z.infer<typeof callbackRowSchema>;
export type SiteGallerySectionKey = z.infer<typeof siteGallerySectionKeySchema>;
export type SiteGalleryImageRow = z.infer<typeof siteGalleryImageRowSchema>;
export type SiteTestimonialAccent = z.infer<typeof siteTestimonialAccentSchema>;
export type SiteTestimonialRow = z.infer<typeof siteTestimonialRowSchema>;
export type SitePrincipleAccent = z.infer<typeof sitePrincipleAccentSchema>;
export type SitePrincipleRow = z.infer<typeof sitePrincipleRowSchema>;
export type SiteContactRow = z.infer<typeof siteContactRowSchema>;
export type SchemaMigrationRow = z.infer<typeof schemaMigrationRowSchema>;
