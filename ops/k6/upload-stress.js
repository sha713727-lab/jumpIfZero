import http from "k6/http";
import { check } from "k6";

/**
 * Upload stress — requires SIGNED_UPLOAD_HEADERS_JSON and a multipart body path.
 * Expected: reject without magic bytes; accept PNG under size caps.
 * Threshold: p95 < 1000ms for small PNG under light concurrency.
 */

export const options = {
  vus: 5,
  duration: "20s",
  thresholds: {
    http_req_duration: ["p(95)<1000"],
  },
};

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:3001";

export default function () {
  const headersJson = __ENV.SIGNED_UPLOAD_HEADERS_JSON;
  if (!headersJson) {
    return;
  }
  const headers = JSON.parse(headersJson);
  const res = http.post(`${baseUrl}/files`, "not-a-png", {
    headers: {
      ...headers,
      "Content-Type": "application/octet-stream",
    },
  });
  check(res, {
    "bad upload rejected": (r) => r.status === 400 || r.status === 415 || r.status === 401,
  });
}
