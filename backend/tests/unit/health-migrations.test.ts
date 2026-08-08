import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

test("readiness EXPECTED_MIGRATIONS includes 0005_site_sections", () => {
  const file = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../src/services/health.ts",
  );
  const src = readFileSync(file, "utf8");
  const match = src.match(/EXPECTED_MIGRATIONS = \[([\s\S]*?)\] as const/);
  assert.ok(match);
  assert.match(match[1] ?? "", /0005_site_sections/);
  for (const version of [
    "0001_init",
    "0002_jz_app_select_soft_delete",
    "0003_password_reset_tokens",
    "0004_phase5_cms",
    "0005_site_sections",
    "0006_phase_x_indexes",
  ]) {
    assert.match(match[1] ?? "", new RegExp(`"${version}"`));
  }
});
