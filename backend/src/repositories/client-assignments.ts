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

export async function hasActiveAssignment(
  input: { readonly clientId: string; readonly employeeId: string },
  client?: DbQueryable,
): Promise<boolean> {
  const result = await query(
    `
      SELECT 1
      FROM client_employee_assignments a
      INNER JOIN clients_active c ON c.id = a.client_id
      WHERE a.client_id = $1
        AND a.employee_id = $2
      LIMIT 1
    `,
    [input.clientId, input.employeeId],
    client,
  );
  return result.rows.length > 0;
}

export async function listActiveClientIdsByEmployeeId(
  employeeId: string,
  client?: DbQueryable,
): Promise<readonly string[]> {
  const result = await query<{ client_id: string }>(
    `
      SELECT a.client_id
      FROM client_employee_assignments a
      INNER JOIN clients_active c ON c.id = a.client_id
      WHERE a.employee_id = $1
      ORDER BY a.client_id ASC
      LIMIT 10000
    `,
    [employeeId],
    client,
  );
  return result.rows.map((row) => row.client_id);
}
