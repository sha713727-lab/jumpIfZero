type CounterKey =
  | "http_requests_total"
  | "http_errors_total"
  | "rate_limit_rejections_total"
  | "uploads_total"
  | "db_queries_total"
  | "db_slow_queries_total";

const counters = new Map<CounterKey, number>();
const latencyBucketsMs = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000] as const;
const latencyCounts = new Map<number, number>();
let latencySumMs = 0;
let latencyCount = 0;

function inc(key: CounterKey, by = 1): void {
  counters.set(key, (counters.get(key) ?? 0) + by);
}

for (const bucket of latencyBucketsMs) {
  latencyCounts.set(bucket, 0);
}

export function recordHttpRequest(input: {
  readonly status: number;
  readonly durationMs: number;
  readonly rateLimited?: boolean;
}): void {
  inc("http_requests_total");
  if (input.status >= 500) {
    inc("http_errors_total");
  }
  if (input.rateLimited) {
    inc("rate_limit_rejections_total");
  }
  latencySumMs += input.durationMs;
  latencyCount += 1;
  for (const bucket of latencyBucketsMs) {
    if (input.durationMs <= bucket) {
      latencyCounts.set(bucket, (latencyCounts.get(bucket) ?? 0) + 1);
      return;
    }
  }
}

export function recordUpload(): void {
  inc("uploads_total");
}

export function recordDbQuery(input: { readonly slow: boolean }): void {
  inc("db_queries_total");
  if (input.slow) {
    inc("db_slow_queries_total");
  }
}

export function renderPrometheusMetrics(): string {
  const lines: string[] = [
    "# HELP jz_http_requests_total Total HTTP requests handled.",
    "# TYPE jz_http_requests_total counter",
    `jz_http_requests_total ${counters.get("http_requests_total") ?? 0}`,
    "# HELP jz_http_errors_total Total HTTP 5xx responses.",
    "# TYPE jz_http_errors_total counter",
    `jz_http_errors_total ${counters.get("http_errors_total") ?? 0}`,
    "# HELP jz_rate_limit_rejections_total Total rate-limit rejections.",
    "# TYPE jz_rate_limit_rejections_total counter",
    `jz_rate_limit_rejections_total ${counters.get("rate_limit_rejections_total") ?? 0}`,
    "# HELP jz_uploads_total Total successful uploads.",
    "# TYPE jz_uploads_total counter",
    `jz_uploads_total ${counters.get("uploads_total") ?? 0}`,
    "# HELP jz_db_queries_total Total database queries.",
    "# TYPE jz_db_queries_total counter",
    `jz_db_queries_total ${counters.get("db_queries_total") ?? 0}`,
    "# HELP jz_db_slow_queries_total Total slow database queries.",
    "# TYPE jz_db_slow_queries_total counter",
    `jz_db_slow_queries_total ${counters.get("db_slow_queries_total") ?? 0}`,
    "# HELP jz_http_request_duration_ms HTTP request duration histogram (ms).",
    "# TYPE jz_http_request_duration_ms histogram",
  ];

  let cumulative = 0;
  for (const bucket of latencyBucketsMs) {
    cumulative += latencyCounts.get(bucket) ?? 0;
    lines.push(
      `jz_http_request_duration_ms_bucket{le="${bucket}"} ${cumulative}`,
    );
  }
  lines.push(
    `jz_http_request_duration_ms_bucket{le="+Inf"} ${latencyCount}`,
  );
  lines.push(`jz_http_request_duration_ms_sum ${latencySumMs}`);
  lines.push(`jz_http_request_duration_ms_count ${latencyCount}`);
  lines.push("");
  return lines.join("\n");
}
