import { z } from "zod";

export const correlationIdSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );

export const hmacHeadersSchema = z.object({
  keyId: z.string().trim().min(1).max(64),
  timestamp: z.coerce.number().int(),
  nonce: z.string().trim().min(16).max(128),
  subjectId: z.uuid(),
  role: z.enum(["admin", "client", "employee", "gateway"]),
  employeeKind: z.enum(["delivery", "sales"]).nullable(),
  signature: z
    .string()
    .trim()
    .regex(/^[0-9a-f]{64}$/i),
});

export type HmacHeaders = z.infer<typeof hmacHeadersSchema>;
