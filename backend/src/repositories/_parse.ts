import { InternalError } from "../lib/errors.ts";

export function parseRow<T>(
  schema: { parse: (input: unknown) => T },
  row: unknown,
): T {
  try {
    return schema.parse(row);
  } catch (err) {
    throw new InternalError("Database row failed validation", err);
  }
}

export function parseRows<T>(
  schema: { parse: (input: unknown) => T },
  rows: readonly unknown[],
): T[] {
  return rows.map((row) => parseRow(schema, row));
}

export function isPgCode(err: unknown, code: string): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === code
  );
}
