import type { PoolClient } from "pg";
import { AppError, InternalError } from "../lib/errors.ts";
import { logger } from "../lib/logger.ts";
import { pool } from "./pool.ts";

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      logger.error({
        msg: "transaction rollback failed",
        err: rollbackErr,
      });
    }

    if (err instanceof AppError) {
      throw err;
    }

    throw new InternalError("Database transaction failed", err);
  } finally {
    client.release();
  }
}
