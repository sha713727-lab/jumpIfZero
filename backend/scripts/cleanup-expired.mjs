import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envPath = path.join(root, "backend", ".env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const pool = new pg.Pool({
  host: env.DATABASE_HOST,
  port: Number(env.DATABASE_PORT),
  database: env.DATABASE_NAME,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  max: 2,
});

async function deleteBatch(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rowCount ?? 0;
}

async function main() {
  const sessions = await deleteBatch(`
    DELETE FROM sessions
    WHERE id IN (
      SELECT id FROM sessions
      WHERE expires_at < now()
         OR (revoked_at IS NOT NULL AND revoked_at < now() - interval '8 hours')
      ORDER BY created_at ASC
      LIMIT 1000
    )
  `);

  const nonces = await deleteBatch(`
    DELETE FROM hmac_nonces
    WHERE nonce IN (
      SELECT nonce FROM hmac_nonces
      WHERE expires_at < now()
      ORDER BY expires_at ASC
      LIMIT 1000
    )
  `);

  const resets = await deleteBatch(`
    DELETE FROM password_reset_tokens
    WHERE id IN (
      SELECT id FROM password_reset_tokens
      WHERE expires_at < now()
         OR used_at IS NOT NULL
      ORDER BY created_at ASC
      LIMIT 1000
    )
  `);

  const idempotency = await deleteBatch(`
    DELETE FROM idempotency_keys
    WHERE id IN (
      SELECT id FROM idempotency_keys
      WHERE expires_at < now()
      ORDER BY expires_at ASC
      LIMIT 1000
    )
  `);

  const rateLimits = await deleteBatch(`
    DELETE FROM rate_limit_buckets
    WHERE bucket_key IN (
      SELECT bucket_key FROM rate_limit_buckets
      WHERE last_refill_at < now() - interval '7 days'
      ORDER BY last_refill_at ASC
      LIMIT 1000
    )
  `);

  process.stdout.write(
    JSON.stringify({
      ok: true,
      deleted: {
        sessions,
        hmacNonces: nonces,
        passwordResetTokens: resets,
        idempotencyKeys: idempotency,
        rateLimitBuckets: rateLimits,
      },
    }) + "\n",
  );
}

main()
  .catch((error) => {
    process.stderr.write(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "cleanup failed",
      }) + "\n",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
