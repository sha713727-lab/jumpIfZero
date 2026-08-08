#!/usr/bin/env node
import { readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const MAX_TOTAL_BYTES = Number(process.env.BUNDLE_BUDGET_BYTES ?? 12_000_000);
const root = path.join(process.cwd(), ".next", "static");

function walk(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      total += walk(full);
    } else {
      total += st.size;
    }
  }
  return total;
}

try {
  if (!existsSync(root)) {
    process.stderr.write("missing .next/static — run build first\n");
    process.exit(1);
  }
  const total = walk(root);
  const payload = JSON.stringify({
    path: ".next/static",
    budgetBytes: MAX_TOTAL_BYTES,
    actualBytes: total,
    ok: total <= MAX_TOTAL_BYTES,
  });
  process.stdout.write(`${payload}\n`);
  if (total > MAX_TOTAL_BYTES) {
    process.exit(1);
  }
} catch (err) {
  process.stderr.write(
    `bundle budget check failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
}
