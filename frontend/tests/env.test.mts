import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveSiteUrl,
  serverEnvSchema,
} from "@jumpifzero/contracts/env";

test("frontend serverEnvSchema rejects placeholder secrets", () => {
  const bad = serverEnvSchema.safeParse({
    SESSION_SECRET: "REPLACE_ME__not_a_real_secret__min_32_chars",
    BACKEND_BASE_URL: "http://127.0.0.1:3001",
    HMAC_SECRET: "local-dev-hmac-secret-key-v1-ok!!",
    HMAC_KEY_ID: "v1",
    HMAC_GATEWAY_SUBJECT_ID: "01900000-0000-7000-8000-000000000099",
  });
  assert.equal(bad.success, false);
});

test("frontend serverEnvSchema accepts non-placeholder secrets", () => {
  const ok = serverEnvSchema.safeParse({
    SESSION_SECRET: "local-dev-session-secret-key-v1-ok",
    BACKEND_BASE_URL: "http://127.0.0.1:3001/",
    HMAC_SECRET: "local-dev-hmac-secret-key-v1-ok!!",
    HMAC_KEY_ID: "v1",
    HMAC_GATEWAY_SUBJECT_ID: "01900000-0000-7000-8000-000000000099",
  });
  assert.equal(ok.success, true);
  if (ok.success) {
    assert.equal(ok.data.BACKEND_BASE_URL, "http://127.0.0.1:3001");
  }
});

test("resolveSiteUrl production requires explicit site url", () => {
  assert.throws(() => resolveSiteUrl({ nodeEnv: "production" }));
  assert.equal(
    resolveSiteUrl({
      vercelUrl: "example.vercel.app",
      nodeEnv: "production",
    }),
    "https://example.vercel.app",
  );
});
