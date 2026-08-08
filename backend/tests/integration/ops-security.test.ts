import assert from "node:assert/strict";
import test from "node:test";
import {
  DEV_PASSWORDS,
  PNG_1X1,
  apiRequest,
  dataOf,
  loginAs,
} from "../helpers/http.ts";

test("client self-update ignores mass-assignment of admin fields", async () => {
  const client = await loginAs(
    DEV_PASSWORDS.client.email,
    DEV_PASSWORDS.client.password,
  );
  const before = dataOf<{
    version: number;
    company: string;
    phone: string;
    location: string;
    clientContactTitle: string;
    statusCode: string;
    plan: string;
    memberSince: string;
  }>(await apiRequest({ method: "GET", path: "/clients/me", actor: client }));

  const patched = await apiRequest({
    method: "PATCH",
    path: "/clients/me",
    actor: client,
    body: {
      version: before.version,
      company: before.company,
      phone: before.phone,
      location: before.location,
      clientContactTitle: before.clientContactTitle,
      statusCode: "paused",
      plan: "enterprise",
      memberSince: "1999-01-01",
    },
  });
  assert.equal(patched.status, 200);
  const after = dataOf<typeof before>(patched);
  assert.equal(after.statusCode, before.statusCode);
  assert.equal(after.plan, before.plan);
  assert.equal(after.memberSince, before.memberSince);
  assert.equal(after.version, before.version + 1);
});

test("optimistic concurrency rejects stale client self version", async () => {
  const client = await loginAs(
    DEV_PASSWORDS.client.email,
    DEV_PASSWORDS.client.password,
  );
  const current = dataOf<{
    version: number;
    company: string;
    phone: string;
    location: string;
    clientContactTitle: string;
  }>(await apiRequest({ method: "GET", path: "/clients/me", actor: client }));

  const stale = await apiRequest({
    method: "PATCH",
    path: "/clients/me",
    actor: client,
    body: {
      version: Math.max(1, current.version - 1),
      company: current.company,
      phone: current.phone,
      location: current.location,
      clientContactTitle: current.clientContactTitle,
    },
  });
  assert.equal(stale.status, 409);
});

test("file upload rejects non-magic payload", async () => {
  const client = await loginAs(
    DEV_PASSWORDS.client.email,
    DEV_PASSWORDS.client.password,
  );
  const own = dataOf<{ id: string }>(
    await apiRequest({ method: "GET", path: "/clients/me", actor: client }),
  );
  const boundary = `jz${crypto.randomUUID().replaceAll("-", "")}`;
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="clientId"\r\n\r\n${own.id}\r\n`,
    ),
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="kind"\r\n\r\n\r\n`,
    ),
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="x.bin"\r\nContent-Type: application/octet-stream\r\n\r\n`,
    ),
    Buffer.from("not-a-real-image"),
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const result = await apiRequest({
    method: "POST",
    path: "/files",
    actor: client,
    rawBody: body,
    headers: {
      "content-type": `multipart/form-data; boundary=${boundary}`,
    },
  });
  assert.ok(result.status === 400 || result.status === 422);
});

test("file upload accepts png magic bytes for own client", async () => {
  const client = await loginAs(
    DEV_PASSWORDS.client.email,
    DEV_PASSWORDS.client.password,
  );
  const own = dataOf<{ id: string }>(
    await apiRequest({ method: "GET", path: "/clients/me", actor: client }),
  );
  const boundary = `jz${crypto.randomUUID().replaceAll("-", "")}`;
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="clientId"\r\n\r\n${own.id}\r\n`,
    ),
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="kind"\r\n\r\n\r\n`,
    ),
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="dot-${crypto.randomUUID()}.png"\r\nContent-Type: image/png\r\n\r\n`,
    ),
    PNG_1X1,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const result = await apiRequest({
    method: "POST",
    path: "/files",
    actor: client,
    rawBody: body,
    headers: {
      "content-type": `multipart/form-data; boundary=${boundary}`,
    },
  });
  assert.ok(result.status === 200 || result.status === 201);
  const file = dataOf<{ id: string; clientId: string }>(result);
  assert.equal(file.clientId, own.id);

  const download = await apiRequest({
    method: "GET",
    path: `/files/${file.id}/download`,
    actor: client,
  });
  assert.equal(download.status, 200);
});
