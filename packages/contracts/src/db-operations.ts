import { z } from "zod";
import {
  clientStatusSchema,
  invoiceStatusSchema,
  projectStatusSchema,
} from "./operations.ts";

export const clientRowSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  company: z.string().max(200),
  phone: z.string().max(64),
  status_code: clientStatusSchema,
  member_since: z.coerce.date(),
  client_contact_title: z.string().max(200),
  location: z.string().max(200),
  plan: z.string().max(200),
  version: z.number().int().min(1),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
  user_name: z.string().min(1).max(200).optional(),
  user_email: z.string().min(3).max(320).optional(),
});

export const assignmentRowSchema = z.object({
  client_id: z.uuid(),
  employee_id: z.uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const projectRowSchema = z.object({
  id: z.uuid(),
  client_id: z.uuid(),
  service_id: z.uuid(),
  title: z.string().min(1).max(200),
  status_code: projectStatusSchema,
  notes: z.string().max(10000),
  manager_employee_id: z.uuid().nullable(),
  next_milestone: z.string().max(500),
  next_milestone_date: z.coerce.date().nullable(),
  progress: z.number().int().min(0).max(100),
  version: z.number().int().min(1),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
});

export const invoiceRowSchema = z.object({
  id: z.uuid(),
  client_id: z.uuid().nullable(),
  number: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  amount: z.union([z.string(), z.number()]).transform((v) => String(v)),
  currency: z.string().length(3),
  status_code: invoiceStatusSchema,
  due_date: z.coerce.date().nullable(),
  issued_on: z.coerce.date().nullable(),
  bill_to_company: z.string().max(200),
  bill_to_name: z.string().max(200),
  bill_to_email: z.string().max(320),
  bill_to_phone: z.string().max(64),
  bill_to_location: z.string().max(200),
  from_company: z.string().max(200),
  from_email: z.string().max(320),
  from_phone: z.string().max(64),
  version: z.number().int().min(1),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
});

export const messageRowSchema = z.object({
  id: z.uuid(),
  client_id: z.uuid(),
  sender_role: z.enum(["admin", "client", "employee"]),
  sender_user_id: z.uuid(),
  body: z.string().max(20000),
  read_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
});

export const fileRowSchema = z.object({
  id: z.uuid(),
  client_id: z.uuid(),
  original_name: z.string().min(1).max(500),
  storage_key: z.string().min(1).max(1024),
  content_type: z.string().min(1).max(255),
  size_bytes: z.coerce.number().int().min(0),
  checksum_sha256: z.string().length(64),
  kind: z.string().max(64),
  uploaded_by_user_id: z.uuid(),
  uploaded_by_role: z.enum(["admin", "client", "employee"]),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
});

export const idempotencyKeyRowSchema = z.object({
  id: z.uuid(),
  idempotency_key: z.string().min(1).max(128),
  method: z.string().min(1).max(16),
  path: z.string().min(1).max(512),
  subject_id: z.uuid().nullable(),
  response_status: z.number().int().min(100).max(599),
  response_body: z.unknown(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  expires_at: z.coerce.date(),
});

export type ClientRow = z.infer<typeof clientRowSchema>;
export type AssignmentRow = z.infer<typeof assignmentRowSchema>;
export type ProjectRow = z.infer<typeof projectRowSchema>;
export type InvoiceRow = z.infer<typeof invoiceRowSchema>;
export type MessageRow = z.infer<typeof messageRowSchema>;
export type FileRow = z.infer<typeof fileRowSchema>;
export type IdempotencyKeyRow = z.infer<typeof idempotencyKeyRowSchema>;
