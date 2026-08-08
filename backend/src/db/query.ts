import type { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import { env } from "../config/env.ts";
import { logger } from "../lib/logger.ts";
import { recordDbQuery } from "../lib/metrics.ts";
import { pool } from "./pool.ts";

export type DbQueryable = Pick<Pool | PoolClient, "query">;

const RETRY_CODES = new Set(["40001", "40P01"]);
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryable(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string" &&
    RETRY_CODES.has((err as { code: string }).code)
  );
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
  client?: DbQueryable,
): Promise<QueryResult<T>> {
  const db = client ?? pool;
  let attempt = 0;

  while (true) {
    const started = performance.now();
    try {
      const result = await db.query<T>(text, [...values]);
      const durationMs = performance.now() - started;
      const slow = durationMs >= env.SLOW_QUERY_MS;
      recordDbQuery({ slow });

      if (slow) {
        logger.warn({
          msg: "slow query",
          durationMs: Math.round(durationMs),
          route: text.replace(/\s+/g, " ").slice(0, 240),
        });
      }

      return result;
    } catch (err) {
      const durationMs = performance.now() - started;
      logger.error({
        msg: "query failed",
        durationMs: Math.round(durationMs),
        route: text.replace(/\s+/g, " ").slice(0, 240),
        err,
      });

      if (isRetryable(err) && attempt < MAX_RETRIES) {
        attempt += 1;
        await sleep(25 * attempt * attempt);
        continue;
      }

      throw err;
    }
  }
}
