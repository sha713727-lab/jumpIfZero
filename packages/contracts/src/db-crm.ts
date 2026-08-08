import { z } from "zod";
import { leadStatusSchema, saleStatusSchema } from "./admin.ts";

export const carrierRowSchema = z.object({
  id: z.uuid(),
  us_dot: z.string().min(1).max(32),
  mc: z.string().min(1).max(32),
  legal_name: z.string().min(1).max(300),
  dba: z.string().max(300),
  business_address: z.string().max(500),
  owner_operator_driver: z.string().max(200),
  tax_id_ciphertext: z.union([
    z.instanceof(Buffer),
    z.instanceof(Uint8Array),
  ]).transform((v) => Buffer.from(v)),
  business_telephone: z.string().max(64),
  version: z.number().int().min(1),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
});

export const partyRowSchema = z.object({
  id: z.uuid(),
  kind: z.enum(["insurance", "factoring"]),
  name: z.string().min(1).max(300),
  phone: z.string().max(64),
  street: z.string().max(300),
  city_state_zip: z.string().max(200),
  email: z.string().max(320),
  version: z.number().int().min(1),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
});

export const saleRowSchema = z.object({
  id: z.uuid(),
  carrier_id: z.uuid(),
  rep_id: z.uuid(),
  status_code: saleStatusSchema,
  amount: z.union([z.string(), z.number()]).transform((v) => String(v)),
  currency: z.string().trim().length(3),
  truck_type: z.string().max(128),
  contact_name: z.string().max(200),
  contact_phone: z.string().max(64),
  contact_email: z.string().max(320),
  truck: z.string().max(200),
  trailer: z.string().max(200),
  insurance_party_id: z.uuid().nullable(),
  factoring_party_id: z.uuid().nullable(),
  approved_by_user_id: z.uuid().nullable(),
  version: z.number().int().min(1),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
});

export const leadRowSchema = z.object({
  id: z.uuid(),
  rep_id: z.uuid(),
  company: z.string().min(1).max(300),
  contact_name: z.string().max(200),
  phone: z.string().max(64),
  email: z.string().max(320),
  source: z.string().max(128),
  status_code: leadStatusSchema,
  notes: z.string().max(10000),
  version: z.number().int().min(1),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
});

export const leadFollowUpRowSchema = z.object({
  id: z.uuid(),
  lead_id: z.uuid(),
  occurred_at: z.coerce.date(),
  note: z.string().max(10000),
  outcome: z.string().max(500),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const salesMessageRowSchema = z.object({
  id: z.uuid(),
  from_rep_id: z.uuid(),
  to_rep_id: z.uuid(),
  body: z.string().min(1).max(20000),
  sent_at: z.coerce.date(),
  read_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type CarrierRow = z.infer<typeof carrierRowSchema>;
export type PartyRow = z.infer<typeof partyRowSchema>;
export type SaleRow = z.infer<typeof saleRowSchema>;
export type LeadRow = z.infer<typeof leadRowSchema>;
export type LeadFollowUpRow = z.infer<typeof leadFollowUpRowSchema>;
export type SalesMessageRow = z.infer<typeof salesMessageRowSchema>;
