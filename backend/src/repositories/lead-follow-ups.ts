import {
  leadFollowUpRowSchema,
  type LeadFollowUpRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";

const FOLLOW_UP_COLUMNS = `
  id, lead_id, occurred_at, note, outcome, created_at, updated_at
`;

export async function getLeadFollowUpById(
  id: string,
  client?: DbQueryable,
): Promise<LeadFollowUpRow | null> {
  const result = await query(
    `
      SELECT ${FOLLOW_UP_COLUMNS}
      FROM lead_follow_ups
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(leadFollowUpRowSchema, row);
}

export async function listLeadFollowUps(input: {
  readonly leadId: string;
  readonly limit: number;
  readonly offset: number;
  readonly sort: "occurred_at" | "created_at";
  readonly dir: "asc" | "desc";
}): Promise<{
  readonly items: readonly LeadFollowUpRow[];
  readonly total: number;
}> {
  const sortColumn =
    input.sort === "created_at" ? "created_at" : "occurred_at";
  const dir = input.dir === "asc" ? "ASC" : "DESC";

  const result = await query(
    `
      SELECT ${FOLLOW_UP_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM lead_follow_ups
      WHERE lead_id = $1
      ORDER BY ${sortColumn} ${dir}, id ASC
      LIMIT $2
      OFFSET $3
    `,
    [input.leadId, input.limit, input.offset],
  );

  const total =
    result.rows.length === 0
      ? 0
      : Number((result.rows[0] as { total_count: number }).total_count);

  return {
    items: result.rows.map((row) => parseRow(leadFollowUpRowSchema, row)),
    total,
  };
}

export async function insertLeadFollowUp(
  input: {
    readonly leadId: string;
    readonly occurredAt: Date;
    readonly note: string;
    readonly outcome: string;
  },
  client?: DbQueryable,
): Promise<LeadFollowUpRow> {
  const result = await query(
    `
      INSERT INTO lead_follow_ups (lead_id, occurred_at, note, outcome)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [input.leadId, input.occurredAt, input.note, input.outcome],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    throw new InternalError("insertLeadFollowUp returned no row");
  }
  const row = await getLeadFollowUpById(id, client);
  if (row === null) {
    throw new InternalError("insertLeadFollowUp could not reload row");
  }
  return row;
}

export async function updateLeadFollowUp(
  input: {
    readonly id: string;
    readonly occurredAt: Date;
    readonly note: string;
    readonly outcome: string;
  },
  client?: DbQueryable,
): Promise<LeadFollowUpRow | null> {
  const result = await query(
    `
      UPDATE lead_follow_ups
      SET
        occurred_at = $2,
        note = $3,
        outcome = $4,
        updated_at = now()
      WHERE id = $1
      RETURNING id
    `,
    [input.id, input.occurredAt, input.note, input.outcome],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getLeadFollowUpById(id, client);
}

export async function deleteLeadFollowUp(
  id: string,
  client?: DbQueryable,
): Promise<boolean> {
  const result = await query(
    `
      DELETE FROM lead_follow_ups
      WHERE id = $1
    `,
    [id],
    client,
  );
  return (result.rowCount ?? 0) > 0;
}
