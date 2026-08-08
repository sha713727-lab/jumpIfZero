import assert from "node:assert/strict";
import test from "node:test";
import {
  DEV_PASSWORDS,
  apiRequest,
  baseUrl,
  dataOf,
  gatewayActor,
  loginAs,
} from "../helpers/http.ts";

test("auth login succeeds for seeded admin", async () => {
  const actor = await loginAs(
    DEV_PASSWORDS.admin.email,
    DEV_PASSWORDS.admin.password,
  );
  assert.equal(actor.role, "admin");
  assert.equal(actor.employeeKind, null);
});

test("auth login rejects bad password", async () => {
  const result = await apiRequest({
    method: "POST",
    path: "/auth/login",
    actor: gatewayActor,
    body: { email: DEV_PASSWORDS.admin.email, password: "WrongPass1!!!!" },
  });
  assert.equal(result.status, 401);
});

test("auth validate and logout round-trip", async () => {
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
  const session = dataOf<{ sessionToken: string }>(login);

  const validated = await apiRequest({
    method: "POST",
    path: "/auth/session/validate",
    actor: gatewayActor,
    body: { sessionToken: session.sessionToken },
  });
  assert.equal(validated.status, 200);

  const loggedOut = await apiRequest({
    method: "POST",
    path: "/auth/logout",
    actor: gatewayActor,
    body: { sessionToken: session.sessionToken },
  });
  assert.equal(loggedOut.status, 200);

  const after = await apiRequest({
    method: "POST",
    path: "/auth/session/validate",
    actor: gatewayActor,
    body: { sessionToken: session.sessionToken },
  });
  assert.equal(after.status, 401);
});

test("unsigned health probe is unauthorized", async () => {
  const response = await fetch(new URL("/health/live", baseUrl));
  assert.equal(response.status, 401);
});
