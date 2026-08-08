import pg from "pg";
import { env } from "../config/env.ts";
import { logger } from "../lib/logger.ts";

const { Pool } = pg;

export const pool = new Pool({
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  database: env.DATABASE_NAME,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  max: env.DATABASE_POOL_MAX,
  idleTimeoutMillis: env.DATABASE_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DATABASE_CONNECTION_TIMEOUT_MS,
  options: `-c statement_timeout=${env.REQUEST_TIMEOUT_MS} -c lock_timeout=10000 -c idle_in_transaction_session_timeout=30000`,
});

pool.on("error", (err: Error) => {
  logger.error({
    msg: "idle client error",
    err,
  });
});

export async function closePool(): Promise<void> {
  await pool.end();
}
