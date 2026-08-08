import { z } from "zod";
import { projectStatusSchema } from "./admin.ts";

export { projectStatusSchema };

export const clientStatusSchema = z.enum(["active", "paused"]);
export const invoiceStatusSchema = z.enum(["draft", "sent", "paid"]);

export const moneyAmountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "amount must be a decimal string");

export const currencySchema = z
  .string()
  .trim()
  .length(3)
  .regex(/^[A-Z]{3}$/);

export const listArchivedFilterSchema = z
  .union([
    z.boolean(),
    z.literal("true"),
    z.literal("false"),
    z.literal("all"),
    z.literal("active"),
    z.literal("archived"),
  ])
  .transform((value) => {
    if (value === true || value === "true" || value === "archived") {
      return "archived" as const;
    }
    if (value === "all") {
      return "all" as const;
    }
    return "active" as const;
  })
  .default("active");

export const sortDirSchema = z.enum(["asc", "desc"]);

export const clientsListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  status: clientStatusSchema.optional(),
  archived: listArchivedFilterSchema,
  sort: z.enum(["created_at", "updated_at", "company", "member_since"]).default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const projectsListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  clientId: z.uuid().optional(),
  status: projectStatusSchema.optional(),
  archived: listArchivedFilterSchema,
  sort: z.enum(["created_at", "updated_at", "title", "status_code"]).default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const invoicesListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  clientId: z.uuid().optional(),
  status: invoiceStatusSchema.optional(),
  archived: listArchivedFilterSchema,
  sort: z.enum(["created_at", "updated_at", "number", "due_date"]).default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const messagesListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  clientId: z.uuid(),
  q: z.string().trim().max(200).optional(),
  archived: listArchivedFilterSchema,
  sort: z.enum(["created_at"]).default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const filesListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  clientId: z.uuid(),
  q: z.string().trim().max(200).optional(),
  archived: listArchivedFilterSchema,
  sort: z.enum(["created_at", "original_name", "size_bytes"]).default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const clientPublicSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  company: z.string().max(200),
  phone: z.string().max(64),
  statusCode: clientStatusSchema,
  memberSince: z.iso.date(),
  clientContactTitle: z.string().max(200),
  location: z.string().max(200),
  plan: z.string().max(200),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
  userName: z.string().min(1).max(200).optional(),
  userEmail: z.string().min(3).max(320).optional(),
  assignedEmployeeIds: z.array(z.uuid()).optional(),
});

export const clientCreateSchema = z.object({
  userId: z.uuid(),
  company: z.string().trim().max(200).default(""),
  phone: z.string().trim().max(64).default(""),
  statusCode: clientStatusSchema.default("active"),
  memberSince: z.iso.date().optional(),
  clientContactTitle: z.string().trim().max(200).default(""),
  location: z.string().trim().max(200).default(""),
  plan: z.string().trim().max(200).default(""),
});

export const clientUpdateSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  company: z.string().trim().max(200),
  phone: z.string().trim().max(64),
  statusCode: clientStatusSchema,
  memberSince: z.iso.date(),
  clientContactTitle: z.string().trim().max(200),
  location: z.string().trim().max(200),
  plan: z.string().trim().max(200),
});

export const clientSelfUpdateSchema = z.object({
  version: z.number().int().min(1),
  company: z.string().trim().max(200),
  phone: z.string().trim().max(64),
  clientContactTitle: z.string().trim().max(200),
  location: z.string().trim().max(200),
});

export const clientArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const clientRestoreSchema = clientArchiveSchema;

export const clientAssignmentsPutSchema = z.object({
  employeeIds: z.array(z.uuid()).max(100),
});

export const assignmentPublicSchema = z.object({
  clientId: z.uuid(),
  employeeId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const projectPublicSchema = z.object({
  id: z.uuid(),
  clientId: z.uuid(),
  serviceId: z.uuid(),
  title: z.string().min(1).max(200),
  statusCode: projectStatusSchema,
  notes: z.string().max(10000),
  managerEmployeeId: z.uuid().nullable(),
  nextMilestone: z.string().max(500),
  nextMilestoneDate: z.iso.date().nullable(),
  progress: z.number().int().min(0).max(100),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
});

export const projectCreateSchema = z.object({
  clientId: z.uuid(),
  serviceId: z.uuid(),
  title: z.string().trim().min(1).max(200),
  statusCode: projectStatusSchema.default("requested"),
  notes: z.string().max(10000).default(""),
  managerEmployeeId: z.uuid().nullable().default(null),
  nextMilestone: z.string().trim().max(500).default(""),
  nextMilestoneDate: z.iso.date().nullable().default(null),
  progress: z.number().int().min(0).max(100).default(0),
});

export const projectUpdateSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  title: z.string().trim().min(1).max(200),
  notes: z.string().max(10000),
  managerEmployeeId: z.uuid().nullable(),
  nextMilestone: z.string().trim().max(500),
  nextMilestoneDate: z.iso.date().nullable(),
  progress: z.number().int().min(0).max(100),
});

export const projectStatusChangeSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  statusCode: projectStatusSchema,
});

export const projectArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const projectRestoreSchema = projectArchiveSchema;

export const invoicePartyFieldsSchema = z.object({
  billToCompany: z.string().trim().max(200),
  billToName: z.string().trim().max(200),
  billToEmail: z.string().trim().max(320),
  billToPhone: z.string().trim().max(64),
  billToLocation: z.string().trim().max(200),
  fromCompany: z.string().trim().max(200),
  fromEmail: z.string().trim().max(320),
  fromPhone: z.string().trim().max(64),
});

export const invoicePublicSchema = z.object({
  id: z.uuid(),
  clientId: z.uuid().nullable(),
  number: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  amount: moneyAmountSchema,
  currency: currencySchema,
  statusCode: invoiceStatusSchema,
  dueDate: z.iso.date().nullable(),
  issuedOn: z.iso.date().nullable(),
  billToCompany: z.string().max(200),
  billToName: z.string().max(200),
  billToEmail: z.string().max(320),
  billToPhone: z.string().max(64),
  billToLocation: z.string().max(200),
  fromCompany: z.string().max(200),
  fromEmail: z.string().max(320),
  fromPhone: z.string().max(64),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
});

export const invoiceCreateSchema = z
  .object({
    clientId: z.uuid().nullable().default(null),
    number: z.string().trim().min(1).max(64),
    title: z.string().trim().min(1).max(200),
    amount: moneyAmountSchema,
    currency: currencySchema.default("USD"),
    statusCode: invoiceStatusSchema.default("draft"),
    dueDate: z.iso.date().nullable().default(null),
    issuedOn: z.iso.date().nullable().default(null),
  })
  .merge(invoicePartyFieldsSchema)
  .superRefine((value, ctx) => {
    if (
      value.clientId === null &&
      value.billToCompany.trim().length === 0 &&
      value.billToName.trim().length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Outsider invoices require Bill to company or name",
        path: ["billToCompany"],
      });
    }
  });

export const invoiceUpdateSchema = z
  .object({
    id: z.uuid(),
    version: z.number().int().min(1),
    title: z.string().trim().min(1).max(200),
    amount: moneyAmountSchema,
    currency: currencySchema,
    statusCode: invoiceStatusSchema,
    dueDate: z.iso.date().nullable(),
    issuedOn: z.iso.date().nullable(),
  })
  .merge(invoicePartyFieldsSchema);

export const invoiceArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const invoiceRestoreSchema = invoiceArchiveSchema;

export const messageAttachmentPublicSchema = z.object({
  fileId: z.uuid(),
  originalName: z.string().min(1).max(500),
  contentType: z.string().min(1).max(255),
  sizeBytes: z.number().int().min(0),
});

export const messagePublicSchema = z.object({
  id: z.uuid(),
  clientId: z.uuid(),
  senderRole: z.enum(["admin", "client", "employee"]),
  senderUserId: z.uuid(),
  body: z.string().max(20000),
  attachments: z.array(messageAttachmentPublicSchema),
  readAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
});

export const messageCreateSchema = z
  .object({
    clientId: z.uuid(),
    body: z.string().trim().max(20000).optional(),
    fileIds: z.array(z.uuid()).max(10).optional(),
  })
  .transform((value) => ({
    clientId: value.clientId,
    body: value.body ?? "",
    fileIds: value.fileIds ?? [],
  }))
  .refine(
    (value) => value.body.length > 0 || value.fileIds.length > 0,
    { message: "Message body or attachments required" },
  );

export const messageIdSchema = z.object({
  id: z.uuid(),
});

export const filePublicSchema = z.object({
  id: z.uuid(),
  clientId: z.uuid(),
  originalName: z.string().min(1).max(500),
  contentType: z.string().min(1).max(255),
  sizeBytes: z.number().int().min(0),
  checksumSha256: z.string().length(64),
  kind: z.string().max(64),
  uploadedByUserId: z.uuid(),
  uploadedByRole: z.enum(["admin", "client", "employee"]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
});

export const fileArchiveSchema = z.object({
  id: z.uuid(),
});

export const idParamSchema = z.object({
  id: z.uuid(),
});

export const listResponseMetaSchema = z.object({
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const clientsListResponseSchema = listResponseMetaSchema.extend({
  items: z.array(clientPublicSchema),
});
export const projectsListResponseSchema = listResponseMetaSchema.extend({
  items: z.array(projectPublicSchema),
});
export const invoicesListResponseSchema = listResponseMetaSchema.extend({
  items: z.array(invoicePublicSchema),
});
export const messagesListResponseSchema = listResponseMetaSchema.extend({
  items: z.array(messagePublicSchema),
});
export const filesListResponseSchema = listResponseMetaSchema.extend({
  items: z.array(filePublicSchema),
});
export const assignmentsListResponseSchema = z.object({
  items: z.array(assignmentPublicSchema),
});

export type ClientPublic = z.infer<typeof clientPublicSchema>;
export type ProjectPublic = z.infer<typeof projectPublicSchema>;
export type InvoicePublic = z.infer<typeof invoicePublicSchema>;
export type MessageAttachmentPublic = z.infer<
  typeof messageAttachmentPublicSchema
>;
export type MessagePublic = z.infer<typeof messagePublicSchema>;
export type FilePublic = z.infer<typeof filePublicSchema>;
