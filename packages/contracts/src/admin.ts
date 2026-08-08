import { z } from "zod";

export const projectStatusSchema = z.enum([
  "requested",
  "approved",
  "in_progress",
  "completed",
]);

export const employeeKindSchema = z.enum(["delivery", "sales"]);

export const saleStatusSchema = z.enum(["draft", "quoted", "won", "lost"]);

export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "qualified",
  "converted",
  "closed",
]);

export const adminServiceSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  path: z.string(),
  image: z.string(),
  active: z.boolean(),
  version: z.number().int().min(1),
  publishedAt: z.iso.datetime().nullable(),
  updatedAt: z.string(),
});

export const adminPortfolioItemSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  category: z.string(),
  summary: z.string(),
  image: z.string(),
  active: z.boolean(),
  version: z.number().int().min(1),
  publishedAt: z.iso.datetime().nullable(),
  updatedAt: z.string(),
});

export const adminBlogPostSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  body: z.string(),
  image: z.string(),
  category: z.string(),
  active: z.boolean(),
  version: z.number().int().min(1),
  publishedAt: z.iso.datetime().nullable(),
  updatedAt: z.string(),
});

export const adminFaqSchema = z.object({
  id: z.uuid(),
  question: z.string(),
  answer: z.string(),
  sortOrder: z.number().int(),
  active: z.boolean(),
  version: z.number().int().min(1),
  publishedAt: z.iso.datetime().nullable(),
  updatedAt: z.string(),
});

export const adminTeamMemberSocialSchema = z.object({
  network: z.enum(["linkedin", "instagram", "x"]),
  label: z.string(),
  href: z.string(),
});

export const adminTeamMemberSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  image: z.string(),
  active: z.boolean(),
  employeeId: z.uuid().nullable(),
  sortOrder: z.number().int(),
  version: z.number().int().min(1),
  publishedAt: z.iso.datetime().nullable(),
  socials: z.array(adminTeamMemberSocialSchema),
  updatedAt: z.string(),
});

export const adminEmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  department: z.string(),
  kind: employeeKindSchema,
  image: z.string(),
  active: z.boolean(),
  teamMemberId: z.string().nullable(),
  updatedAt: z.string(),
});

export const adminSaleSchema = z.object({
  id: z.string(),
  carrierId: z.string(),
  repId: z.string(),
  status: saleStatusSchema,
  amount: z.string(),
  currency: z.string(),
  usDot: z.string(),
  mc: z.string(),
  legalName: z.string(),
  dba: z.string(),
  businessAddress: z.string(),
  ownerOperatorDriver: z.string(),
  taxId: z.string(),
  salesAgent: z.string(),
  businessTelephone: z.string(),
  truckType: z.string(),
  contactName: z.string(),
  contactPhone: z.string(),
  contactEmail: z.string(),
  truck: z.string(),
  trailer: z.string(),
  insuranceName: z.string(),
  insurancePhone: z.string(),
  insuranceStreet: z.string(),
  insuranceCityStateZip: z.string(),
  insuranceEmail: z.string(),
  factoringName: z.string(),
  factoringPhone: z.string(),
  factoringStreet: z.string(),
  factoringCityStateZip: z.string(),
  factoringEmail: z.string(),
  approvedBy: z.string(),
  version: z.number().int().min(1),
  updatedAt: z.string(),
});

export const adminLeadSchema = z.object({
  id: z.string(),
  repId: z.string(),
  company: z.string(),
  contactName: z.string(),
  phone: z.string(),
  email: z.string(),
  source: z.string(),
  status: leadStatusSchema,
  notes: z.string(),
  version: z.number().int().min(1),
  updatedAt: z.string(),
});

export const adminLeadFollowUpSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  at: z.string(),
  note: z.string(),
  outcome: z.string(),
});

export const adminSalesMessageSchema = z.object({
  id: z.string(),
  fromRepId: z.string(),
  toRepId: z.string(),
  body: z.string(),
  at: z.string(),
  read: z.boolean(),
});

export const adminClientSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  company: z.string(),
  phone: z.string(),
  location: z.string(),
  plan: z.string(),
  clientContactTitle: z.string(),
  status: z.enum(["active", "paused"]),
  initials: z.string(),
  memberSince: z.string(),
  assignedEmployeeIds: z.array(z.string()),
  version: z.number().int().min(1),
  updatedAt: z.string(),
});

export const adminProjectSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  title: z.string(),
  service: z.string(),
  status: projectStatusSchema,
  notes: z.string(),
  version: z.number().int().min(1),
  updatedAt: z.string(),
});

export const adminMessageAttachmentSchema = z.object({
  fileId: z.string(),
  name: z.string(),
  contentType: z.string(),
  sizeBytes: z.number().int().min(0),
});

export const adminMessageSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  from: z.enum(["admin", "client", "employee"]),
  body: z.string(),
  at: z.string(),
  createdAt: z.iso.datetime(),
  read: z.boolean(),
  attachments: z.array(adminMessageAttachmentSchema),
});

export const adminInvoiceSchema = z.object({
  id: z.string(),
  clientId: z.string().nullable(),
  number: z.string(),
  title: z.string(),
  amount: z.string(),
  billToCompany: z.string(),
  status: z.enum(["draft", "sent", "paid"]),
  version: z.number().int().min(1),
  updatedAt: z.string(),
});

export const adminFileSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string(),
  kind: z.string(),
  url: z.string().nullable(),
  updatedAt: z.string(),
});

export const adminCallbackSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  note: z.string(),
  status: z.enum(["new", "resolved"]),
  version: z.number().int().min(1),
  updatedAt: z.string(),
});

export const adminContactMessageSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  subject: z.string(),
  body: z.string(),
  status: z.enum(["new", "read"]),
  version: z.number().int().min(1),
  updatedAt: z.string(),
});

export const adminSiteGallerySectionKeySchema = z.enum([
  "about_gallery",
  "studio_flow",
]);

export const adminSiteGalleryImageSchema = z.object({
  id: z.uuid(),
  sectionKey: adminSiteGallerySectionKeySchema,
  image: z.string(),
  altText: z.string(),
  sortOrder: z.number().int(),
  active: z.boolean(),
  version: z.number().int().min(1),
  publishedAt: z.iso.datetime().nullable(),
  updatedAt: z.string(),
});

export const adminSiteTestimonialAccentSchema = z.enum([
  "brand",
  "secondary",
  "dark",
]);

export const adminSiteTestimonialSchema = z.object({
  id: z.uuid(),
  quote: z.string(),
  authorName: z.string(),
  roleTitle: z.string(),
  company: z.string(),
  accent: adminSiteTestimonialAccentSchema,
  image: z.string(),
  sortOrder: z.number().int(),
  active: z.boolean(),
  version: z.number().int().min(1),
  publishedAt: z.iso.datetime().nullable(),
  updatedAt: z.string(),
});

export const adminSitePrincipleAccentSchema = z.enum(["brand", "secondary"]);

export const adminSitePrincipleSchema = z.object({
  id: z.uuid(),
  indexLabel: z.string(),
  title: z.string(),
  body: z.string(),
  accent: adminSitePrincipleAccentSchema,
  image: z.string(),
  imageAlt: z.string(),
  sortOrder: z.number().int(),
  active: z.boolean(),
  version: z.number().int().min(1),
  publishedAt: z.iso.datetime().nullable(),
  updatedAt: z.string(),
});

export const adminDemoStateSchema = z.object({
  services: z.array(adminServiceSchema),
  portfolio: z.array(adminPortfolioItemSchema),
  blog: z.array(adminBlogPostSchema),
  faqs: z.array(adminFaqSchema),
  team: z.array(adminTeamMemberSchema),
  employees: z.array(adminEmployeeSchema),
  clients: z.array(adminClientSchema),
  projects: z.array(adminProjectSchema),
  messages: z.array(adminMessageSchema),
  invoices: z.array(adminInvoiceSchema),
  files: z.array(adminFileSchema),
  callbacks: z.array(adminCallbackSchema),
  contactMessages: z.array(adminContactMessageSchema),
  sales: z.array(adminSaleSchema),
  leads: z.array(adminLeadSchema),
  leadFollowUps: z.array(adminLeadFollowUpSchema),
  salesMessages: z.array(adminSalesMessageSchema),
  siteGallery: z.array(adminSiteGalleryImageSchema),
  siteTestimonials: z.array(adminSiteTestimonialSchema),
  sitePrinciples: z.array(adminSitePrincipleSchema),
});

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type EmployeeKind = z.infer<typeof employeeKindSchema>;
export type SaleStatus = z.infer<typeof saleStatusSchema>;
export type LeadStatus = z.infer<typeof leadStatusSchema>;
export type AdminService = z.infer<typeof adminServiceSchema>;
export type AdminPortfolioItem = z.infer<typeof adminPortfolioItemSchema>;
export type AdminBlogPost = z.infer<typeof adminBlogPostSchema>;
export type AdminFaq = z.infer<typeof adminFaqSchema>;
export type AdminTeamMember = z.infer<typeof adminTeamMemberSchema>;
export type AdminTeamMemberSocial = z.infer<typeof adminTeamMemberSocialSchema>;
export type AdminEmployee = z.infer<typeof adminEmployeeSchema>;
export type AdminSale = z.infer<typeof adminSaleSchema>;
export type AdminLead = z.infer<typeof adminLeadSchema>;
export type AdminLeadFollowUp = z.infer<typeof adminLeadFollowUpSchema>;
export type AdminSalesMessage = z.infer<typeof adminSalesMessageSchema>;
export type AdminClient = z.infer<typeof adminClientSchema>;
export type AdminProject = z.infer<typeof adminProjectSchema>;
export type AdminMessage = z.infer<typeof adminMessageSchema>;
export type AdminInvoice = z.infer<typeof adminInvoiceSchema>;
export type AdminFile = z.infer<typeof adminFileSchema>;
export type AdminCallback = z.infer<typeof adminCallbackSchema>;
export type AdminContactMessage = z.infer<typeof adminContactMessageSchema>;
export type AdminSiteGallerySectionKey = z.infer<
  typeof adminSiteGallerySectionKeySchema
>;
export type AdminSiteGalleryImage = z.infer<typeof adminSiteGalleryImageSchema>;
export type AdminSiteTestimonialAccent = z.infer<
  typeof adminSiteTestimonialAccentSchema
>;
export type AdminSiteTestimonial = z.infer<typeof adminSiteTestimonialSchema>;
export type AdminSitePrincipleAccent = z.infer<
  typeof adminSitePrincipleAccentSchema
>;
export type AdminSitePrinciple = z.infer<typeof adminSitePrincipleSchema>;
export type AdminDemoState = z.infer<typeof adminDemoStateSchema>;
