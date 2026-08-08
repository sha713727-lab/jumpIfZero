import { z } from "zod";
import {
  leadStatusSchema,
  saleStatusSchema,
} from "./admin.ts";
import { currencySchema, moneyAmountSchema } from "./operations.ts";

export { saleStatusSchema, leadStatusSchema };

export const positiveMoneyAmountSchema = moneyAmountSchema.refine(
  (value) => Number(value) > 0,
  { message: "amount must be greater than 0" },
);

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

export const carriersListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  archived: listArchivedFilterSchema,
  sort: z
    .enum(["created_at", "updated_at", "legal_name", "us_dot", "mc"])
    .default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const partiesListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  kind: z.enum(["insurance", "factoring"]).optional(),
  archived: listArchivedFilterSchema,
  sort: z.enum(["created_at", "updated_at", "name", "kind"]).default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const salesListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  status: saleStatusSchema.optional(),
  repId: z.uuid().optional(),
  archived: listArchivedFilterSchema,
  sort: z.enum(["created_at", "updated_at", "status_code", "amount"]).default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const leadsListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  status: leadStatusSchema.optional(),
  repId: z.uuid().optional(),
  archived: listArchivedFilterSchema,
  sort: z.enum(["created_at", "updated_at", "company", "status_code"]).default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const leadFollowUpsListQuerySchema = z.object({
  leadId: z.uuid(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  sort: z.enum(["occurred_at", "created_at"]).default("occurred_at"),
  dir: sortDirSchema.default("desc"),
});

export const salesMessagesListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  peerRepId: z.uuid().optional(),
  q: z.string().trim().max(200).optional(),
  sort: z.enum(["sent_at"]).default("sent_at"),
  dir: sortDirSchema.default("desc"),
});

export const carrierPublicSchema = z.object({
  id: z.uuid(),
  usDot: z.string().min(1).max(32),
  mc: z.string().min(1).max(32),
  legalName: z.string().min(1).max(300),
  dba: z.string().max(300),
  businessAddress: z.string().max(500),
  ownerOperatorDriver: z.string().max(200),
  taxIdMasked: z.string().max(64),
  businessTelephone: z.string().max(64),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
});

export const carrierCreateSchema = z.object({
  usDot: z.string().trim().min(1).max(32),
  mc: z.string().trim().min(1).max(32),
  legalName: z.string().trim().min(1).max(300),
  dba: z.string().trim().max(300).default(""),
  businessAddress: z.string().trim().max(500).default(""),
  ownerOperatorDriver: z.string().trim().max(200).default(""),
  taxId: z.string().trim().min(1).max(32),
  businessTelephone: z.string().trim().max(64).default(""),
});

export const carrierUpdateSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  usDot: z.string().trim().min(1).max(32),
  mc: z.string().trim().min(1).max(32),
  legalName: z.string().trim().min(1).max(300),
  dba: z.string().trim().max(300),
  businessAddress: z.string().trim().max(500),
  ownerOperatorDriver: z.string().trim().max(200),
  taxId: z.string().trim().min(1).max(32).optional(),
  businessTelephone: z.string().trim().max(64),
});

export const carrierArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const carrierRestoreSchema = carrierArchiveSchema;

export const partyPublicSchema = z.object({
  id: z.uuid(),
  kind: z.enum(["insurance", "factoring"]),
  name: z.string().min(1).max(300),
  phone: z.string().max(64),
  street: z.string().max(300),
  cityStateZip: z.string().max(200),
  email: z.string().max(320),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
});

export const partyCreateSchema = z.object({
  kind: z.enum(["insurance", "factoring"]),
  name: z.string().trim().min(1).max(300),
  phone: z.string().trim().max(64).default(""),
  street: z.string().trim().max(300).default(""),
  cityStateZip: z.string().trim().max(200).default(""),
  email: z.string().trim().max(320).default(""),
});

export const partyUpdateSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  name: z.string().trim().min(1).max(300),
  phone: z.string().trim().max(64),
  street: z.string().trim().max(300),
  cityStateZip: z.string().trim().max(200),
  email: z.string().trim().max(320),
});

export const partyArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const partyRestoreSchema = partyArchiveSchema;

export const saleSheetPublicSchema = z.object({
  id: z.uuid(),
  carrierId: z.uuid(),
  repId: z.uuid(),
  statusCode: saleStatusSchema,
  amount: moneyAmountSchema,
  currency: currencySchema,
  truckType: z.string().max(128),
  contactName: z.string().max(200),
  contactPhone: z.string().max(64),
  contactEmail: z.string().max(320),
  truck: z.string().max(200),
  trailer: z.string().max(200),
  insurancePartyId: z.uuid().nullable(),
  factoringPartyId: z.uuid().nullable(),
  approvedByUserId: z.uuid().nullable(),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
  usDot: z.string().min(1).max(32),
  mc: z.string().min(1).max(32),
  legalName: z.string().min(1).max(300),
  dba: z.string().max(300),
  businessAddress: z.string().max(500),
  ownerOperatorDriver: z.string().max(200),
  taxIdMasked: z.string().max(64),
  businessTelephone: z.string().max(64),
  salesAgent: z.string().max(200),
  insuranceName: z.string().max(300),
  insurancePhone: z.string().max(64),
  insuranceStreet: z.string().max(300),
  insuranceCityStateZip: z.string().max(200),
  insuranceEmail: z.string().max(320),
  factoringName: z.string().max(300),
  factoringPhone: z.string().max(64),
  factoringStreet: z.string().max(300),
  factoringCityStateZip: z.string().max(200),
  factoringEmail: z.string().max(320),
  approvedBy: z.string().max(200),
});

export const saleSheetWriteSchema = z.object({
  usDot: z.string().trim().min(1).max(32),
  mc: z.string().trim().min(1).max(32),
  legalName: z.string().trim().min(1).max(300),
  dba: z.string().trim().max(300).default(""),
  businessAddress: z.string().trim().max(500).default(""),
  ownerOperatorDriver: z.string().trim().max(200).default(""),
  taxId: z.string().trim().min(1).max(32),
  businessTelephone: z.string().trim().max(64).default(""),
  truckType: z.string().trim().max(128).default(""),
  contactName: z.string().trim().max(200).default(""),
  contactPhone: z.string().trim().max(64).default(""),
  contactEmail: z.string().trim().max(320).default(""),
  truck: z.string().trim().max(200).default(""),
  trailer: z.string().trim().max(200).default(""),
  insuranceName: z.string().trim().max(300).default(""),
  insurancePhone: z.string().trim().max(64).default(""),
  insuranceStreet: z.string().trim().max(300).default(""),
  insuranceCityStateZip: z.string().trim().max(200).default(""),
  insuranceEmail: z.string().trim().max(320).default(""),
  factoringName: z.string().trim().max(300).default(""),
  factoringPhone: z.string().trim().max(64).default(""),
  factoringStreet: z.string().trim().max(300).default(""),
  factoringCityStateZip: z.string().trim().max(200).default(""),
  factoringEmail: z.string().trim().max(320).default(""),
  amount: positiveMoneyAmountSchema,
  currency: currencySchema,
  statusCode: saleStatusSchema.default("draft"),
  approvedByUserId: z.uuid().nullable().optional(),
});

export const saleSheetCreateSchema = saleSheetWriteSchema.extend({
  repId: z.uuid().optional(),
});

export const saleSheetUpdateSchema = saleSheetWriteSchema
  .omit({ taxId: true })
  .extend({
    id: z.uuid(),
    version: z.number().int().min(1),
    taxId: z.string().trim().min(1).max(32).optional(),
  });

export const saleStatusChangeSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  statusCode: saleStatusSchema,
});

export const saleArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const saleRestoreSchema = saleArchiveSchema;

export const leadPublicSchema = z.object({
  id: z.uuid(),
  repId: z.uuid(),
  company: z.string().min(1).max(300),
  contactName: z.string().max(200),
  phone: z.string().max(64),
  email: z.string().max(320),
  source: z.string().max(128),
  statusCode: leadStatusSchema,
  notes: z.string().max(10000),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
});

export const leadCreateSchema = z.object({
  company: z.string().trim().min(1).max(300),
  contactName: z.string().trim().max(200).default(""),
  phone: z.string().trim().max(64).default(""),
  email: z.string().trim().max(320).default(""),
  source: z.string().trim().max(128).default(""),
  statusCode: leadStatusSchema.default("new"),
  notes: z.string().trim().max(10000).default(""),
  repId: z.uuid().optional(),
});

export const leadUpdateSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  company: z.string().trim().min(1).max(300),
  contactName: z.string().trim().max(200),
  phone: z.string().trim().max(64),
  email: z.string().trim().max(320),
  source: z.string().trim().max(128),
  notes: z.string().trim().max(10000),
});

export const leadStatusChangeSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  statusCode: leadStatusSchema,
});

export const leadArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const leadRestoreSchema = leadArchiveSchema;

export const leadFollowUpPublicSchema = z.object({
  id: z.uuid(),
  leadId: z.uuid(),
  occurredAt: z.iso.datetime(),
  note: z.string().max(10000),
  outcome: z.string().max(500),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const leadFollowUpCreateSchema = z.object({
  leadId: z.uuid(),
  occurredAt: z.iso.datetime(),
  note: z.string().trim().max(10000).default(""),
  outcome: z.string().trim().max(500).default(""),
});

export const leadFollowUpUpdateSchema = z.object({
  id: z.uuid(),
  occurredAt: z.iso.datetime(),
  note: z.string().trim().max(10000),
  outcome: z.string().trim().max(500),
});

export const salesMessagePublicSchema = z.object({
  id: z.uuid(),
  fromRepId: z.uuid(),
  toRepId: z.uuid(),
  body: z.string().min(1).max(20000),
  sentAt: z.iso.datetime(),
  readAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const salesMessageCreateSchema = z.object({
  toRepId: z.uuid(),
  body: z.string().trim().min(1).max(20000),
});

export const idParamSchema = z.object({
  id: z.uuid(),
});

export const listResponseMetaSchema = z.object({
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const carriersListResponseSchema = listResponseMetaSchema.extend({
  items: z.array(carrierPublicSchema),
});
export const partiesListResponseSchema = listResponseMetaSchema.extend({
  items: z.array(partyPublicSchema),
});
export const salesListResponseSchema = listResponseMetaSchema.extend({
  items: z.array(saleSheetPublicSchema),
});
export const leadsListResponseSchema = listResponseMetaSchema.extend({
  items: z.array(leadPublicSchema),
});
export const leadFollowUpsListResponseSchema = listResponseMetaSchema.extend({
  items: z.array(leadFollowUpPublicSchema),
});
export const salesMessagesListResponseSchema = listResponseMetaSchema.extend({
  items: z.array(salesMessagePublicSchema),
});

export const taxIdRevealResponseSchema = z.object({
  carrierId: z.uuid(),
  taxId: z.string().min(1).max(32),
});

export type CarrierPublic = z.infer<typeof carrierPublicSchema>;
export type PartyPublic = z.infer<typeof partyPublicSchema>;
export type SaleSheetPublic = z.infer<typeof saleSheetPublicSchema>;
export type LeadPublic = z.infer<typeof leadPublicSchema>;
export type LeadFollowUpPublic = z.infer<typeof leadFollowUpPublicSchema>;
export type SalesMessagePublic = z.infer<typeof salesMessagePublicSchema>;
