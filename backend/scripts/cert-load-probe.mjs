import { createHash, createHmac, randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const env = Object.fromEntries(
  readFileSync(path.join(root, "backend", ".env"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const baseUrl = `http://${env.HOST}:${env.PORT}`;

function sign(method, pathname) {
  const body = Buffer.alloc(0);
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce =
    randomUUID().replaceAll("-", "") +
    randomUUID().replaceAll("-", "").slice(0, 8);
  const payload = [
    "v1",
    method,
    pathname,
    "",
    createHash("sha256").update(body).digest("hex"),
    String(timestamp),
    nonce,
    env.HMAC_GATEWAY_SUBJECT_ID,
    "gateway",
    "-",
    env.HMAC_KEY_ID,
  ].join("\n");
  const signature = createHmac("sha256", env.HMAC_SECRET)
    .update(payload, "utf8")
    .digest("hex");
  return {
    "x-jz-key-id": env.HMAC_KEY_ID,
    "x-jz-timestamp": String(timestamp),
    "x-jz-nonce": nonce,
    "x-jz-subject-id": env.HMAC_GATEWAY_SUBJECT_ID,
    "x-jz-role": "gateway",
    "x-jz-signature": signature,
  };
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const idx = Math.min(
    sorted.length - 1,
    Math.ceil((p / 100) * sorted.length) - 1,
  );
  return sorted[Math.max(0, idx)];
}

async function oneRequest(pathname) {
  const t0 = performance.now();
  const res = await fetch(`${baseUrl}${pathname}`, {
    method: "GET",
    headers: sign("GET", pathname),
  });
  const ms = performance.now() - t0;
  return { status: res.status, ms };
}

async function runLevel(concurrency, total) {
  const latencies = [];
  const statuses = {};
  let errors = 0;
  let ok = 0;
  let inFlight = 0;
  let started = 0;
  const t0 = performance.now();

  await new Promise((resolve) => {
    const launch = () => {
      while (inFlight < concurrency && started < total) {
        started += 1;
        inFlight += 1;
        void oneRequest("/health/live").then((r) => {
          latencies.push(r.ms);
          statuses[r.status] = (statuses[r.status] ?? 0) + 1;
          if (r.status >= 400) errors += 1;
          else ok += 1;
          inFlight -= 1;
          if (ok + errors >= total) resolve(undefined);
          else launch();
        });
      }
    };
    launch();
  });

  const elapsedSec = (performance.now() - t0) / 1000;
  latencies.sort((a, b) => a - b);
  return {
    concurrency,
    total,
    ok,
    errors,
    errorPct: (errors / total) * 100,
    statuses,
    rps: total / elapsedSec,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    max: latencies[latencies.length - 1],
    elapsedSec,
  };
}

const levels = [1, 10, 50, 100, 250, 500];
const results = [];
for (const c of levels) {
  const total = Math.min(Math.max(c * 2, 20), 500);
  results.push(await runLevel(c, total));
}
process.stdout.write(`${JSON.stringify({ endpoint: "/health/live", results }, null, 2)}\n`);
