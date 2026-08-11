import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

test("readiness EXPECTED_MIGRATIONS matches every *.up.sql migration", () => {
  const unitDir = path.dirname(fileURLToPath(import.meta.url));
  const root = path.join(unitDir, "../../..");
  const migrationsDir = path.join(root, "database", "migrations");
  const onDisk = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".up.sql"))
    .map((name) => name.replace(/\.up\.sql$/, ""))
    .sort();

  const healthSrc = readFileSync(
    path.join(unitDir, "../../src/services/health.ts"),
    "utf8",
  );
  const block = healthSrc.match(
    /export const EXPECTED_MIGRATIONS = \[([\s\S]*?)\] as const;/,
  );
  assert.ok(block, "EXPECTED_MIGRATIONS block missing");
  const listed = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();
  assert.deepEqual(listed, onDisk);
});
