import {
  assignmentRowSchema,
  type AssignmentRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { parseRow } from "./_parse.ts";

export async function listAssignmentsByClientId(
  clientId: string,
  client?: DbQueryable,
): Promise<readonly AssignmentRow[]> {
  const result = await query(
    `
      SELECT client_id, employee_id, created_at, updated_at
      FROM client_employee_assignments
      WHERE client_id = $1
      ORDER BY created_at ASC, employee_id ASC
    `,
    [clientId],
    client,
  );
  return result.rows.map((row) => parseRow(assignmentRowSchema, row));
}

export async function replaceClientAssignments(
  input: {
    readonly clientId: string;
    readonly employeeIds: readonly string[];
  },
  client: DbQueryable,
): Promise<readonly AssignmentRow[]> {
  const uniqueIds = [...new Set(input.employeeIds)];

  await query(
    `
      DELETE FROM client_employee_assignments
      WHERE client_id = $1
        AND NOT (employee_id = ANY($2::uuid[]))
    `,
    [input.clientId, uniqueIds],
    client,
  );

  if (uniqueIds.length > 0) {
    await query(
      `
        INSERT INTO client_employee_assignments (client_id, employee_id)
        SELECT $1, x
        FROM unnest($2::uuid[]) AS x
        ON CONFLICT (client_id, employee_id) DO NOTHING
      `,
      [input.clientId, uniqueIds],
      client,
    );
  }

  return listAssignmentsByClientId(input.clientId, client);
}

export async function countActiveDeliveryEmployees(
  employeeIds: readonly string[],
  client?: DbQueryable,
): Promise<number> {
  const uniqueIds = [...new Set(employeeIds)];
  if (uniqueIds.length === 0) {
    return 0;
  }
  const result = await query<{ count: number }>(
    `
      SELECT COUNT(*)::int AS count
      FROM employees_active
      WHERE id = ANY($1::uuid[])
        AND kind = 'delivery'
    `,
    [uniqueIds],
    client,
  );
  return Number(result.rows[0]?.count ?? 0);
}
