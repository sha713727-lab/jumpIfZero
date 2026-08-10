import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "client", "employee"]);
export const employeeKindSchema = z.enum(["delivery", "sales"]);
export const hmacRoleSchema = z.enum([
  "admin",
  "client",
  "employee",
  "gateway",
]);

export const sessionCookieNameSchema = z.enum([
  "__Host-jz_session_admin",
  "__Host-jz_session_customer",
  "__Host-jz_session_employee",
]);

export const sessionCookieMetaSchema = z.object({
  name: sessionCookieNameSchema,
  maxAge: z.number().int().positive(),
  httpOnly: z.literal(true),
  secure: z.literal(true),
  sameSite: z.literal("lax"),
  path: z.literal("/"),
});

export const authSubjectSchema = z.object({
  subjectId: z.uuid(),
  role: userRoleSchema,
  employeeKind: employeeKindSchema.nullable(),
  employeeId: z.uuid().nullable(),
  name: z.string().min(1).max(200),
  email: z.string().trim().min(3).max(320).pipe(z.email()),
  title: z.string().min(1).max(200).nullable(),
});

export const loginRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1)
    .max(320)
    .pipe(z.email()),
  password: z.string().min(1).max(200),
});

export const loginResponseSchema = z.object({
  sessionToken: z.string().min(32).max(256),
  sessionId: z.uuid(),
  expiresAt: z.iso.datetime(),
  subject: authSubjectSchema,
  cookie: sessionCookieMetaSchema,
});

export const sessionTokenRequestSchema = z.object({
  sessionToken: z.string().min(32).max(256),
});

export const sessionValidateResponseSchema = z.object({
  sessionId: z.uuid(),
  expiresAt: z.iso.datetime(),
  subject: authSubjectSchema,
  cookie: sessionCookieMetaSchema,
});

export const logoutResponseSchema = z.object({
  revoked: z.literal(true),
});

export const passwordForgotRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1)
    .max(320)
    .pipe(z.email()),
});

export const passwordForgotResponseSchema = z.object({
  accepted: z.literal(true),
  resetToken: z.string().min(32).max(256),
});

export const passwordResetRequestSchema = z.object({
  resetToken: z.string().min(32).max(256),
  newPassword: z.string().min(8).max(200),
});

export const passwordResetResponseSchema = z.object({
  reset: z.literal(true),
});

export const passwordChangeRequestSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200),
});

export const passwordChangeResponseSchema = z.object({
  changed: z.literal(true),
});

export const customerRegisterRequestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z
    .string()
    .trim()
    .min(1)
    .max(320)
    .pipe(z.email()),
  password: z.string().min(8).max(200),
  company: z.string().trim().max(200).default(""),
});

export const customerRegisterResponseSchema = z.object({
  registered: z.literal(true),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type HmacRole = z.infer<typeof hmacRoleSchema>;
export type AuthSubject = z.infer<typeof authSubjectSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type SessionTokenRequest = z.infer<typeof sessionTokenRequestSchema>;
export type SessionValidateResponse = z.infer<
  typeof sessionValidateResponseSchema
>;
export type PasswordForgotRequest = z.infer<typeof passwordForgotRequestSchema>;
export type PasswordForgotResponse = z.infer<
  typeof passwordForgotResponseSchema
>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordChangeRequest = z.infer<typeof passwordChangeRequestSchema>;
export type CustomerRegisterRequest = z.infer<
  typeof customerRegisterRequestSchema
>;
export type CustomerRegisterResponse = z.infer<
  typeof customerRegisterResponseSchema
>;
