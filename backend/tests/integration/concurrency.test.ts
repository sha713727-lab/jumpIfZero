import assert from "node:assert/strict";
import test from "node:test";
import {
  DEV_PASSWORDS,
  apiRequest,
  gatewayActor,
  loginAs,
} from "../helpers/http.ts";

test("concurrency: parallel session validates stay consistent", async () => {
  const actor = await loginAs(
    DEV_PASSWORDS.admin.email,
    DEV_PASSWORDS.admin.password,
  );
  const login = await apiRequest({
    method: "POST",
    path: "/auth/login",
    actor: gatewayActor,
    body: {
      email: DEV_PASSWORDS.client.email,
      password: DEV_PASSWORDS.client.password,
    },
  });
  assert.equal(login.status, 200);
  const sessionToken = (
    login.json as { data: { sessionToken: string } }
  ).data.sessionToken;

  const results = await Promise.all(
    Array.from({ length: 8 }, () =>
      apiRequest({
        method: "POST",
        path: "/auth/session/validate",
        actor: gatewayActor,
        body: { sessionToken },
      }),
    ),
  );

  for (const result of results) {
    assert.equal(result.status, 200);
  }
  assert.equal(actor.role, "admin");
});

test("security regression: unknown hmac key id is rejected", async () => {
  const result = await apiRequest({
    method: "GET",
    path: "/health/live",
    actor: gatewayActor,
    headers: { "x-jz-key-id": "unknown-key-id" },
  });
  assert.equal(result.status, 401);
});
