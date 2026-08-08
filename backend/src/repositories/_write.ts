import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { pool } from "../db/pool.ts";
import { InternalError } from "../lib/errors.ts";

export async function nextUuidv7(
  client: DbQueryable = pool,
): Promise<string> {
  const result = await query<{ id: string }>(
    `SELECT uuidv7() AS id`,
    [],
    client,
  );
  const row = result.rows[0];
  if (row === undefined || typeof row.id !== "string") {
    throw new InternalError("uuidv7() returned no id");
  }
  return row.id;
}
