import {
  schemaMigrationRowSchema,
  type SchemaMigrationRow,
} from "@jumpifzero/contracts";
import { query } from "../db/query.ts";
import { parseRows } from "./_parse.ts";

const LIST_LIMIT = 1000;

export async function listSchemaMigrations(): Promise<
  readonly SchemaMigrationRow[]
> {
  const result = await query(
    `
      SELECT version, checksum, applied_at
      FROM schema_migrations
      ORDER BY applied_at ASC, version ASC
      LIMIT $1
    `,
    [LIST_LIMIT],
  );

  return parseRows(schemaMigrationRowSchema, result.rows);
}
