import assert from "node:assert/strict";
import test from "node:test";
import { backendEnvSchema } from "@jumpifzero/contracts/backend-env";

const validBackend = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "3001",
  DATABASE_HOST: "127.0.0.1",
  DATABASE_PORT: "5433",
  DATABASE_NAME: "jumpifzero",
  DATABASE_USER: "jz_app",
  DATABASE_PASSWORD: "local-dev-jz-app-password-32chars!!",
  HMAC_SECRET: "local-dev-hmac-secret-key-v1-ok!!",
  HMAC_SECRET_PREVIOUS: "",
  HMAC_KEY_ID: "v1",
  HMAC_KEY_ID_PREVIOUS: "",
  HMAC_GATEWAY_SUBJECT_ID: "01900000-0000-7000-8000-000000000099",
  TAX_ID_AEAD_KEY: "AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA=",
  TAX_ID_AEAD_KEY_PREVIOUS: "",
  FILE_STORAGE_ROOT: "/tmp/jz-files",
  CORS_ORIGIN: "http://localhost:3000",
  REQUEST_TIMEOUT_MS: "30000",
  BODY_MAX_BYTES: "1048576",
  SLOW_QUERY_MS: "500",
};

test("platform defaults keep local single-node envelope", () => {
  const parsed = backendEnvSchema.safeParse(validBackend);
  assert.equal(parsed.success, true);
  if (!parsed.success) {
    return;
  }
  assert.equal(parsed.data.FILE_STORAGE_BACKEND, "local");
  assert.equal(parsed.data.RATE_LIMIT_BACKEND, "postgres");
  assert.equal(parsed.data.NONCE_BACKEND, "postgres");
  assert.equal(parsed.data.OTEL_ENABLED, false);
  assert.equal(parsed.data.SENTRY_DSN, undefined);
  assert.equal(parsed.data.METRICS_ENABLED, false);
});

test("s3 backend requires bucket and region", () => {
  const parsed = backendEnvSchema.safeParse({
    ...validBackend,
    FILE_STORAGE_BACKEND: "s3",
  });
  assert.equal(parsed.success, false);
});

test("s3 backend accepts minio-style config", () => {
  const parsed = backendEnvSchema.safeParse({
    ...validBackend,
    FILE_STORAGE_BACKEND: "s3",
    S3_BUCKET: "jz",
    S3_REGION: "us-east-1",
    S3_ENDPOINT: "http://127.0.0.1:9000",
    S3_ACCESS_KEY_ID: "minio",
    S3_SECRET_ACCESS_KEY: "minio123",
    S3_FORCE_PATH_STYLE: "true",
  });
  assert.equal(parsed.success, true);
});

test("redis backends require REDIS_URL", () => {
  const parsed = backendEnvSchema.safeParse({
    ...validBackend,
    RATE_LIMIT_BACKEND: "redis",
  });
  assert.equal(parsed.success, false);
});

test("redis backends accept REDIS_URL", () => {
  const parsed = backendEnvSchema.safeParse({
    ...validBackend,
    RATE_LIMIT_BACKEND: "redis",
    NONCE_BACKEND: "redis",
    REDIS_URL: "redis://127.0.0.1:6379",
  });
  assert.equal(parsed.success, true);
});

test("otel requires exporter endpoint when enabled", () => {
  const parsed = backendEnvSchema.safeParse({
    ...validBackend,
    OTEL_ENABLED: "true",
  });
  assert.equal(parsed.success, false);
});
