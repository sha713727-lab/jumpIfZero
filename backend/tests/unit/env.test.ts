import assert from "node:assert/strict";
import test from "node:test";
import { backendEnvSchema } from "@jumpifzero/contracts/backend-env";
import { serverEnvSchema, resolveSiteUrl } from "@jumpifzero/contracts/env";

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
  FILE_STORAGE_ROOT: "/var/lib/jumpifzero/files",
  CORS_ORIGIN: "http://localhost:3000",
  REQUEST_TIMEOUT_MS: "30000",
  BODY_MAX_BYTES: "1048576",
  SLOW_QUERY_MS: "500",
};

test("backendEnvSchema accepts valid configuration", () => {
  const parsed = backendEnvSchema.safeParse(validBackend);
  assert.equal(parsed.success, true);
});

test("backendEnvSchema rejects placeholder database password", () => {
  const parsed = backendEnvSchema.safeParse({
    ...validBackend,
    DATABASE_PASSWORD: "replace-with-jz-app-password-32chars",
  });
  assert.equal(parsed.success, false);
});

test("backendEnvSchema rejects uniform AEAD key bytes", () => {
  const parsed = backendEnvSchema.safeParse({
    ...validBackend,
    TAX_ID_AEAD_KEY: "AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI=",
  });
  assert.equal(parsed.success, false);
});

test("backendEnvSchema requires jz_app database user", () => {
  const parsed = backendEnvSchema.safeParse({
    ...validBackend,
    DATABASE_USER: "postgres",
  });
  assert.equal(parsed.success, false);
});

test("backendEnvSchema requires previous key id with previous secret", () => {
  const parsed = backendEnvSchema.safeParse({
    ...validBackend,
    HMAC_SECRET_PREVIOUS: "local-dev-hmac-secret-key-v0-ok!!",
    HMAC_KEY_ID_PREVIOUS: "",
  });
  assert.equal(parsed.success, false);
});

test("backendEnvSchema accepts bound previous key rotation pair", () => {
  const parsed = backendEnvSchema.safeParse({
    ...validBackend,
    HMAC_SECRET_PREVIOUS: "local-dev-hmac-secret-key-v0-ok!!",
    HMAC_KEY_ID_PREVIOUS: "v0",
  });
  assert.equal(parsed.success, true);
});

test("backendEnvSchema rejects identical current and previous key ids", () => {
  const parsed = backendEnvSchema.safeParse({
    ...validBackend,
    HMAC_SECRET_PREVIOUS: "local-dev-hmac-secret-key-v0-ok!!",
    HMAC_KEY_ID_PREVIOUS: "v1",
  });
  assert.equal(parsed.success, false);
});

test("backendEnvSchema accepts pool and metrics defaults when omitted", () => {
  const parsed = backendEnvSchema.safeParse(validBackend);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.DATABASE_POOL_MAX, 10);
    assert.equal(parsed.data.METRICS_ENABLED, false);
    assert.equal(parsed.data.FILE_STORAGE_BACKEND, "local");
    assert.equal(parsed.data.SHUTDOWN_DRAIN_MS, 15_000);
  }
});

test("serverEnvSchema rejects REPLACE_ME session secrets", () => {
  const parsed = serverEnvSchema.safeParse({
    SESSION_SECRET: "REPLACE_ME__not_a_real_secret__min_32_chars",
    BACKEND_BASE_URL: "http://127.0.0.1:3001",
    HMAC_SECRET: "local-dev-hmac-secret-key-v1-ok!!",
    HMAC_KEY_ID: "v1",
    HMAC_GATEWAY_SUBJECT_ID: "01900000-0000-7000-8000-000000000099",
  });
  assert.equal(parsed.success, false);
});

test("serverEnvSchema accepts local-dev secrets", () => {
  const parsed = serverEnvSchema.safeParse({
    SESSION_SECRET: "local-dev-session-secret-key-v1-ok",
    BACKEND_BASE_URL: "http://127.0.0.1:3001",
    HMAC_SECRET: "local-dev-hmac-secret-key-v1-ok!!",
    HMAC_KEY_ID: "v1",
    HMAC_GATEWAY_SUBJECT_ID: "01900000-0000-7000-8000-000000000099",
  });
  assert.equal(parsed.success, true);
});

test("resolveSiteUrl fails closed in production without site url", () => {
  assert.throws(() => resolveSiteUrl({ nodeEnv: "production" }));
  assert.equal(
    resolveSiteUrl({ siteUrl: "https://example.com/" }),
    "https://example.com",
  );
});
