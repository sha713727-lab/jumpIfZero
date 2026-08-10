import { z } from "zod";
import { employeeKindSchema, userRoleSchema } from "./auth.ts";

export const identitySortSchema = z.enum([
  "created_at",
  "updated_at",
  "email",
  "name",
]);

export const sortDirSchema = z.enum(["asc", "desc"]);

export const usersListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  role: userRoleSchema.optional(),
  archived: z
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
    .default("active"),
  sort: identitySortSchema.default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const employeesListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  q: z.string().trim().max(200).optional(),
  kind: employeeKindSchema.optional(),
  archived: z
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
    .default("active"),
  sort: z.enum(["created_at", "updated_at", "kind"]).default("created_at"),
  dir: sortDirSchema.default("desc"),
});

export const userPublicSchema = z.object({
  id: z.uuid(),
  email: z.string().min(3).max(320),
  name: z.string().min(1).max(200),
  title: z.string().min(1).max(200).nullable(),
  role: userRoleSchema,
  imagePath: z.string().max(1024),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
});

export const userCreateSchema = z.object({
  email: z.string().trim().min(3).max(320).pipe(z.email()),
  password: z.string().min(8).max(200),
  name: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200).nullable().default(null),
  role: userRoleSchema,
});

export const userAdminUpdateSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  name: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200).nullable(),
  email: z.string().trim().min(3).max(320).pipe(z.email()),
});

export const userSelfUpdateSchema = z.object({
  version: z.number().int().min(1),
  name: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200).nullable(),
  imagePath: z.string().trim().max(1024).optional(),
});

export const userRoleChangeSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  role: userRoleSchema,
});

export const userPasswordSetSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  password: z.string().min(8).max(200),
});

export const userArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const userRestoreSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const employeePublicSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  title: z.string().max(200),
  department: z.string().max(200),
  kind: employeeKindSchema,
  imagePath: z.string().max(1024),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  archivedAt: z.iso.datetime().nullable(),
  user: z
    .object({
      email: z.string().min(3).max(320),
      name: z.string().min(1).max(200),
      title: z.string().min(1).max(200).nullable(),
      role: z.literal("employee"),
    })
    .optional(),
});

export const employeeCreateSchema = z.object({
  userId: z.uuid(),
  title: z.string().trim().max(200).default(""),
  department: z.string().trim().max(200).default(""),
  kind: employeeKindSchema,
  imagePath: z.string().trim().max(1024).default(""),
});

export const employeeUpdateSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  title: z.string().trim().max(200),
  department: z.string().trim().max(200),
  imagePath: z.string().trim().max(1024),
});

export const employeeSelfImageUpdateSchema = z.object({
  version: z.number().int().min(1),
  imagePath: z.string().trim().max(1024),
});

export const employeeKindChangeSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  kind: employeeKindSchema,
});

export const employeeArchiveSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const employeeRestoreSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
});

export const idParamSchema = z.object({
  id: z.uuid(),
});

export const usersListResponseSchema = z.object({
  items: z.array(userPublicSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export const employeesListResponseSchema = z.object({
  items: z.array(employeePublicSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export type UserPublic = z.infer<typeof userPublicSchema>;
export type EmployeePublic = z.infer<typeof employeePublicSchema>;
export type UsersListQuery = z.infer<typeof usersListQuerySchema>;
export type EmployeesListQuery = z.infer<typeof employeesListQuerySchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type EmployeeCreate = z.infer<typeof employeeCreateSchema>;
