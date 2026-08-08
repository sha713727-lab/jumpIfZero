import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";

export async function insertTaxIdAccessAudit(input: {
  readonly carrierId: string | null;
  readonly carrierUsDot: string;
  readonly carrierMc: string;
  readonly carrierLegalName: string;
  readonly viewerUserId: string;
  readonly viewerRole: "admin" | "client" | "employee";
  readonly viewerEmail: string;
  readonly correlationId: string;
  readonly client?: DbQueryable;
}): Promise<void> {
  await query(
    `
      INSERT INTO tax_id_access_audit (
        carrier_id,
        carrier_us_dot,
        carrier_mc,
        carrier_legal_name,
        viewer_user_id,
        viewer_role,
        viewer_email,
        correlation_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      input.carrierId,
      input.carrierUsDot,
      input.carrierMc,
      input.carrierLegalName,
      input.viewerUserId,
      input.viewerRole,
      input.viewerEmail,
      input.correlationId,
    ],
    input.client,
  );
}
