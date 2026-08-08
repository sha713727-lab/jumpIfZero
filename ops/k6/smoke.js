import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Requires: k6 binary installed separately (not an npm dependency).
 * Env:
 *   BASE_URL=http://127.0.0.1:3001
 *   HMAC headers must be supplied by a signing sidecar or precompute —
 *   this script expects the backend to reject unsigned calls (asserts 401)
 *   for the anonymous smoke, and uses a signed ready probe when
 *   SIGNED_READY_HEADERS_JSON is set.
 *
 * Thresholds (starting budgets — tune after baselines):
 *   - http_req_failed < 1% for signed probes
 *   - http_req_duration p95 < 300ms on private network
 */

export const options = {
  scenarios: {
    anonymous_health: {
      executor: "constant-vus",
      vus: 5,
      duration: "30s",
      exec: "anonymousHealth",
    },
    signed_ready: {
      executor: "constant-arrival-rate",
      rate: 10,
      timeUnit: "1s",
      duration: "30s",
      preAllocatedVUs: 10,
      exec: "signedReady",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<300"],
  },
};

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:3001";

export function anonymousHealth() {
  const res = http.get(`${baseUrl}/health/live`);
  check(res, {
    "unsigned live is 401": (r) => r.status === 401,
  });
  sleep(0.2);
}

export function signedReady() {
  const raw = __ENV.SIGNED_READY_HEADERS_JSON;
  if (!raw) {
    return;
  }
  const headers = JSON.parse(raw);
  const res = http.get(`${baseUrl}/health/ready`, { headers });
  check(res, {
    "signed ready is 200": (r) => r.status === 200,
  });
}
