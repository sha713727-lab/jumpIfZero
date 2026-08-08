import pg from "pg";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const env = Object.fromEntries(
  readFileSync(path.join(root, "backend", ".env"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const client = new pg.Client({
  host: env.DATABASE_HOST,
  port: Number(env.DATABASE_PORT),
  database: env.DATABASE_NAME,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
});

const queries = [
  {
    name: "clients.list.active",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM clients WHERE archived_at IS NULL ORDER BY created_at DESC LIMIT 100`,
  },
  {
    name: "projects.list",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM projects WHERE archived_at IS NULL ORDER BY updated_at DESC LIMIT 100`,
  },
  {
    name: "messages.by_client",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM messages WHERE client_id = (SELECT id FROM clients WHERE archived_at IS NULL LIMIT 1)
      AND archived_at IS NULL ORDER BY created_at DESC LIMIT 100`,
  },
  {
    name: "files.by_client",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM files WHERE client_id = (SELECT id FROM clients WHERE archived_at IS NULL LIMIT 1)
      AND archived_at IS NULL ORDER BY created_at DESC LIMIT 100`,
  },
  {
    name: "lead_follow_ups.by_lead",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM lead_follow_ups WHERE lead_id = (SELECT id FROM leads WHERE archived_at IS NULL LIMIT 1)
      ORDER BY occurred_at DESC LIMIT 100`,
  },
  {
    name: "hmac_nonces.cleanup_select",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT nonce FROM hmac_nonces WHERE created_at < NOW() - INTERVAL '5 minutes' LIMIT 100`,
  },
  {
    name: "sessions.validate_lookup",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM sessions WHERE token_hash = repeat('a', 64) LIMIT 1`,
  },
  {
    name: "content.services.list",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM services WHERE archived_at IS NULL ORDER BY updated_at DESC LIMIT 100`,
  },
  {
    name: "employees.list",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM employees WHERE archived_at IS NULL ORDER BY updated_at DESC LIMIT 100`,
  },
  {
    name: "sales.list",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM sales WHERE archived_at IS NULL ORDER BY updated_at DESC LIMIT 100`,
  },
];

async function main() {
  await client.connect();
  const poolStats = await client.query(`
    SELECT numbackends, xact_commit, xact_rollback, blks_read, blks_hit,
           tup_returned, tup_fetched, conflicts, deadlocks
    FROM pg_stat_database WHERE datname = current_database()
  `);
  const tableCounts = await client.query(`
    SELECT relname, n_live_tup, n_dead_tup, last_vacuum, last_autovacuum
    FROM pg_stat_user_tables
    ORDER BY n_live_tup DESC
    LIMIT 20
  `);

  const explains = [];
  for (const q of queries) {
    try {
      const res = await client.query(q.sql);
      const plan = res.rows[0]["QUERY PLAN"][0];
      const ms = plan["Execution Time"];
      explains.push({
        name: q.name,
        executionMs: ms,
        planningMs: plan["Planning Time"],
        slow: ms >= 25,
        nodeType: plan.Plan?.["Node Type"],
        actualRows: plan.Plan?.["Actual Rows"],
        sharedHit: plan.Plan?.["Shared Hit Blocks"],
        sharedRead: plan.Plan?.["Shared Read Blocks"],
      });
    } catch (err) {
      explains.push({ name: q.name, error: String(err.message || err) });
    }
  }

  const out = {
    poolStats: poolStats.rows[0],
    tableCounts: tableCounts.rows,
    explains,
    slowQueries: explains.filter((e) => e.slow),
  };
  const outPath = path.join(root, "backend", "scripts", "perf-audit-sql-results.json");
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
