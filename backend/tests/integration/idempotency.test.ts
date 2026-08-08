import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import {
  DEV_PASSWORDS,
  apiRequest,
  dataOf,
  loginAs,
} from "../helpers/http.ts";

test("invoice create is idempotent for the same Idempotency-Key", async () => {
  const admin = await loginAs(
    DEV_PASSWORDS.admin.email,
    DEV_PASSWORDS.admin.password,
  );
  const clients = dataOf<{ items: Array<{ id: string }> }>(
    await apiRequest({
      method: "GET",
      path: "/clients?limit=1",
      actor: admin,
    }),
  );
  assert.ok(clients.items[0]);
  const clientId = clients.items[0].id;
  const key = `test-${randomUUID()}`;
  const body = {
    clientId,
    number: `INV-T-${Date.now()}`,
    title: "Phase7 idempotency",
    amount: "10.00",
    currency: "USD",
    statusCode: "draft",
    billToCompany: "Test Co",
    billToName: "Test Contact",
    billToEmail: "test@example.com",
    billToPhone: "",
    billToLocation: "",
    fromCompany: "JZ Enterprises",
    fromEmail: "billing@example.com",
    fromPhone: "555-0000",
  };

  const first = await apiRequest({
    method: "POST",
    path: "/invoices",
    actor: admin,
    body,
    headers: { "idempotency-key": key },
  });
  assert.ok(first.status === 200 || first.status === 201);
  const created = dataOf<{ id: string; number: string }>(first);

  const second = await apiRequest({
    method: "POST",
    path: "/invoices",
    actor: admin,
    body,
    headers: { "idempotency-key": key },
  });
  assert.ok(second.status === 200 || second.status === 201);
  const replay = dataOf<{ id: string; number: string }>(second);
  assert.equal(replay.id, created.id);
  assert.equal(replay.number, created.number);
});
