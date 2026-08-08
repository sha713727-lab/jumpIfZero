import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

Object.assign(process.env, {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "3001",
  DATABASE_HOST: "127.0.0.1",
  DATABASE_PORT: "5433",
  DATABASE_NAME: "jumpifzero",
  DATABASE_USER: "jz_app",
  DATABASE_PASSWORD: "local-dev-jz-app-password-32chars!!",
  HMAC_SECRET: "local-dev-hmac-secret-key-v1-ok!!",
  HMAC_SECRET_PREVIOUS: "local-dev-hmac-secret-key-v0-ok!!",
  HMAC_KEY_ID: "v1",
  HMAC_KEY_ID_PREVIOUS: "v0",
  HMAC_GATEWAY_SUBJECT_ID: "01900000-0000-7000-8000-000000000099",
  TAX_ID_AEAD_KEY: "AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA=",
  TAX_ID_AEAD_KEY_PREVIOUS: "",
  FILE_STORAGE_ROOT: "/tmp/jz-files",
  CORS_ORIGIN: "http://localhost:3000",
  REQUEST_TIMEOUT_MS: "30000",
  BODY_MAX_BYTES: "1048576",
  SLOW_QUERY_MS: "500",
});

const { resolveHmacSecretForKeyId } = await import("../../src/lib/crypto.ts");

const CURRENT_KEY = "v2";
const PREVIOUS_KEY = "v1";
const CURRENT_SECRET = "local-dev-hmac-secret-key-v2-ok!!";
const PREVIOUS_SECRET = "local-dev-hmac-secret-key-v1-ok!!";
const PAYLOAD = "v1\nGET\n/health/live\n\nabc\n1\nnonce\nsub\ngateway\n-\nv2";

test("current keyId maps only to current secret", () => {
  assert.equal(
    resolveHmacSecretForKeyId({
      keyId: CURRENT_KEY,
      currentKeyId: CURRENT_KEY,
      currentSecret: CURRENT_SECRET,
      previousKeyId: PREVIOUS_KEY,
      previousSecret: PREVIOUS_SECRET,
    }),
    CURRENT_SECRET,
  );
});

test("previous keyId maps only to previous secret", () => {
  assert.equal(
    resolveHmacSecretForKeyId({
      keyId: PREVIOUS_KEY,
      currentKeyId: CURRENT_KEY,
      currentSecret: CURRENT_SECRET,
      previousKeyId: PREVIOUS_KEY,
      previousSecret: PREVIOUS_SECRET,
    }),
    PREVIOUS_SECRET,
  );
});

test("unknown keyId is rejected", () => {
  assert.equal(
    resolveHmacSecretForKeyId({
      keyId: "v99",
      currentKeyId: CURRENT_KEY,
      currentSecret: CURRENT_SECRET,
      previousKeyId: PREVIOUS_KEY,
      previousSecret: PREVIOUS_SECRET,
    }),
    null,
  );
});

test("previous secret alone does not accept arbitrary keyId", () => {
  assert.equal(
    resolveHmacSecretForKeyId({
      keyId: "anything",
      currentKeyId: CURRENT_KEY,
      currentSecret: CURRENT_SECRET,
      previousKeyId: PREVIOUS_KEY,
      previousSecret: PREVIOUS_SECRET,
    }),
    null,
  );
});

test("omitted previous keyId rejects non-current keyId", () => {
  assert.equal(
    resolveHmacSecretForKeyId({
      keyId: PREVIOUS_KEY,
      currentKeyId: CURRENT_KEY,
      currentSecret: CURRENT_SECRET,
      previousSecret: PREVIOUS_SECRET,
    }),
    null,
  );
});

test("current keyId + previous secret signature does not match mapped secret", () => {
  const mapped = resolveHmacSecretForKeyId({
    keyId: CURRENT_KEY,
    currentKeyId: CURRENT_KEY,
    currentSecret: CURRENT_SECRET,
    previousKeyId: PREVIOUS_KEY,
    previousSecret: PREVIOUS_SECRET,
  });
  assert.equal(mapped, CURRENT_SECRET);
  const withPrevious = createHmac("sha256", PREVIOUS_SECRET)
    .update(PAYLOAD, "utf8")
    .digest("hex");
  const withMapped = createHmac("sha256", mapped!)
    .update(PAYLOAD, "utf8")
    .digest("hex");
  assert.notEqual(withMapped, withPrevious);
});

test("previous keyId + current secret signature does not match mapped secret", () => {
  const mapped = resolveHmacSecretForKeyId({
    keyId: PREVIOUS_KEY,
    currentKeyId: CURRENT_KEY,
    currentSecret: CURRENT_SECRET,
    previousKeyId: PREVIOUS_KEY,
    previousSecret: PREVIOUS_SECRET,
  });
  assert.equal(mapped, PREVIOUS_SECRET);
  const withCurrent = createHmac("sha256", CURRENT_SECRET)
    .update(PAYLOAD, "utf8")
    .digest("hex");
  const withMapped = createHmac("sha256", mapped!)
    .update(PAYLOAD, "utf8")
    .digest("hex");
  assert.notEqual(withMapped, withCurrent);
});
