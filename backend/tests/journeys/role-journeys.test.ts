import assert from "node:assert/strict";
import test from "node:test";
import {
  DEV_PASSWORDS,
  apiRequest,
  dataOf,
  gatewayActor,
  loginAs,
} from "../helpers/http.ts";

test("journey: admin login → users → clients → projects → invoices → CRM → CMS → logout", async () => {
  const login = await apiRequest({
    method: "POST",
    path: "/auth/login",
    actor: gatewayActor,
    body: {
      email: DEV_PASSWORDS.admin.email,
      password: DEV_PASSWORDS.admin.password,
    },
  });
  assert.equal(login.status, 200);
  const session = dataOf<{
    sessionToken: string;
    subject: { subjectId: string; role: string };
  }>(login);
  const admin = {
    subjectId: session.subject.subjectId,
    role: session.subject.role,
    employeeKind: null,
  };

  for (const path of [
    "/users?limit=10",
    "/clients?limit=10",
    "/projects?limit=10",
    "/invoices?limit=10",
    "/sales?limit=10",
    "/content/services?limit=10",
  ]) {
    const result = await apiRequest({ method: "GET", path, actor: admin });
    assert.equal(result.status, 200, path);
  }

  const logout = await apiRequest({
    method: "POST",
    path: "/auth/logout",
    actor: gatewayActor,
    body: { sessionToken: session.sessionToken },
  });
  assert.equal(logout.status, 200);
});

test("journey: customer login → me → messages → files", async () => {
  const client = await loginAs(
    DEV_PASSWORDS.client.email,
    DEV_PASSWORDS.client.password,
  );
  for (const path of ["/users/me", "/clients/me", "/projects?limit=10"]) {
    const result = await apiRequest({ method: "GET", path, actor: client });
    assert.equal(result.status, 200, path);
  }
  const own = dataOf<{ id: string }>(
    await apiRequest({ method: "GET", path: "/clients/me", actor: client }),
  );
  assert.equal(
    (
      await apiRequest({
        method: "GET",
        path: `/messages?limit=10&clientId=${own.id}`,
        actor: client,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await apiRequest({
        method: "GET",
        path: `/files?limit=10&clientId=${own.id}`,
        actor: client,
      })
    ).status,
    200,
  );
});

test("journey: delivery login → clients → projects → files", async () => {
  const delivery = await loginAs(
    DEV_PASSWORDS.delivery.email,
    DEV_PASSWORDS.delivery.password,
  );
  assert.equal(delivery.employeeKind, "delivery");
  const clients = dataOf<{ items: Array<{ id: string }> }>(
    await apiRequest({
      method: "GET",
      path: "/clients?limit=10",
      actor: delivery,
    }),
  );
  assert.equal(
    (
      await apiRequest({
        method: "GET",
        path: "/projects?limit=10",
        actor: delivery,
      })
    ).status,
    200,
  );
  if (clients.items[0]) {
    const files = await apiRequest({
      method: "GET",
      path: `/files?limit=10&clientId=${clients.items[0].id}`,
      actor: delivery,
    });
    assert.equal(files.status, 200);
  }
});

test("journey: sales login → CRM only", async () => {
  const sales = await loginAs(
    DEV_PASSWORDS.sales.email,
    DEV_PASSWORDS.sales.password,
  );
  assert.equal(sales.employeeKind, "sales");
  assert.equal(
    (
      await apiRequest({
        method: "GET",
        path: "/sales?limit=10",
        actor: sales,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await apiRequest({
        method: "GET",
        path: "/leads?limit=10",
        actor: sales,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await apiRequest({
        method: "GET",
        path: "/clients?limit=10",
        actor: sales,
      })
    ).status,
    403,
  );
});
