import { z } from "zod";

export const userAuthRowSchema = z.object({
  id: z.uuid(),
  email: z.string().min(3).max(320),
  password_hash: z.string().min(20).max(255),
  name: z.string().min(1).max(200),
  title: z.string().min(1).max(200).nullable(),
  role: z.enum(["admin", "client", "employee"]),
  version: z.number().int().min(1),
});

export const userPublicRowSchema = z.object({
  id: z.uuid(),
  email: z.string().min(3).max(320),
  name: z.string().min(1).max(200),
  title: z.string().min(1).max(200).nullable(),
  role: z.enum(["admin", "client", "employee"]),
  image_path: z.string().max(1024),
  version: z.number().int().min(1),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
});

export const employeeKindRowSchema = z.object({
  kind: z.enum(["delivery", "sales"]),
});

export const employeeAuthRowSchema = z.object({
  id: z.uuid(),
  kind: z.enum(["delivery", "sales"]),
});

export const employeePublicRowSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  title: z.string().max(200),
  department: z.string().max(200),
  kind: z.enum(["delivery", "sales"]),
  image_path: z.string().max(1024),
  version: z.number().int().min(1),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
  user_email: z.string().min(3).max(320).optional(),
  user_name: z.string().min(1).max(200).optional(),
  user_title: z.string().min(1).max(200).nullable().optional(),
});

export const sessionRowSchema = z.object({
  id: z.uuid(),
  subject_id: z.uuid(),
  token_hash: z.string().min(32).max(128),
  expires_at: z.coerce.date(),
  revoked_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const passwordResetTokenRowSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  token_hash: z.string().min(32).max(128),
  expires_at: z.coerce.date(),
  used_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type UserAuthRow = z.infer<typeof userAuthRowSchema>;
export type UserPublicRow = z.infer<typeof userPublicRowSchema>;
export type EmployeeAuthRow = z.infer<typeof employeeAuthRowSchema>;
export type EmployeePublicRow = z.infer<typeof employeePublicRowSchema>;
export type SessionRow = z.infer<typeof sessionRowSchema>;
export type PasswordResetTokenRow = z.infer<typeof passwordResetTokenRowSchema>;
