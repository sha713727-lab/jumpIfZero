import assert from "node:assert/strict";
import test from "node:test";
import {
  DEV_PASSWORDS,
  apiRequest,
  dataOf,
  loginAs,
} from "../helpers/http.ts";

test("RBAC: delivery and sales cannot use clients/me", async () => {
  const delivery = await loginAs(
    DEV_PASSWORDS.delivery.email,
    DEV_PASSWORDS.delivery.password,
  );
  const sales = await loginAs(
    DEV_PASSWORDS.sales.email,
    DEV_PASSWORDS.sales.password,
  );
  assert.equal(
    (await apiRequest({ method: "GET", path: "/clients/me", actor: delivery }))
      .status,
    403,
  );
  assert.equal(
    (await apiRequest({ method: "GET", path: "/clients/me", actor: sales }))
      .status,
    403,
  );
});

test("RBAC: sales cannot list ops clients; delivery can", async () => {
  const delivery = await loginAs(
    DEV_PASSWORDS.delivery.email,
    DEV_PASSWORDS.delivery.password,
  );
  const sales = await loginAs(
    DEV_PASSWORDS.sales.email,
    DEV_PASSWORDS.sales.password,
  );
  assert.equal(
    (
      await apiRequest({
        method: "GET",
        path: "/clients?limit=10",
        actor: delivery,
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

test("RBAC: client cannot list CMS admin content write path", async () => {
  const client = await loginAs(
    DEV_PASSWORDS.client.email,
    DEV_PASSWORDS.client.password,
  );
  const result = await apiRequest({
    method: "POST",
    path: "/content/faqs",
    actor: client,
    body: {
      question: "x",
      answer: "y",
      sortOrder: 0,
      published: false,
    },
  });
  assert.ok(result.status === 401 || result.status === 403);
});

test("RBAC: delivery cannot access sales CRM list", async () => {
  const delivery = await loginAs(
    DEV_PASSWORDS.delivery.email,
    DEV_PASSWORDS.delivery.password,
  );
  const result = await apiRequest({
    method: "GET",
    path: "/sales?limit=10",
    actor: delivery,
  });
  assert.equal(result.status, 403);
});

test("ownership: client cannot PATCH another client via admin path", async () => {
  const client = await loginAs(
    DEV_PASSWORDS.client.email,
    DEV_PASSWORDS.client.password,
  );
  const own = dataOf<{
    id: string;
    version: number;
    company: string;
    phone: string;
    location: string;
    clientContactTitle: string;
    statusCode: string;
    plan: string;
    memberSince: string;
  }>(await apiRequest({ method: "GET", path: "/clients/me", actor: client }));
  const result = await apiRequest({
    method: "PATCH",
    path: `/clients/${own.id}`,
    actor: client,
    body: {
      id: own.id,
      version: own.version,
      company: own.company,
      phone: own.phone,
      location: own.location,
      clientContactTitle: own.clientContactTitle,
      statusCode: own.statusCode,
      plan: own.plan,
      memberSince: own.memberSince,
    },
  });
  assert.equal(result.status, 403);
});
