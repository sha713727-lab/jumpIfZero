import { createHash, createHmac, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const env = Object.fromEntries(
  readFileSync(path.join(root, "backend", ".env"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const base = `http://${env.HOST}:${env.PORT}`;
const hmacSecret = env.HMAC_SECRET;
const keyId = env.HMAC_KEY_ID;
const gateway = {
  subjectId: env.HMAC_GATEWAY_SUBJECT_ID,
  role: "gateway",
  employeeKind: null,
};

function sha256Hex(data) {
  return createHash("sha256").update(data).digest("hex");
}

function canonicalQuery(searchParams) {
  const pairs = [];
  const keys = [...new Set(searchParams.keys())].sort();
  for (const key of keys) {
    for (const value of searchParams.getAll(key).sort()) {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return pairs.join("&");
}

function sign({ method, url, body, subjectId, role, employeeKind }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce =
    randomUUID().replaceAll("-", "") +
    randomUUID().replaceAll("-", "").slice(0, 8);
  const payload = [
    "v1",
    method.toUpperCase(),
    url.pathname,
    canonicalQuery(url.searchParams),
    sha256Hex(body),
    String(timestamp),
    nonce,
    subjectId,
    role,
    employeeKind ?? "-",
    keyId,
  ].join("\n");
  const signature = createHmac("sha256", hmacSecret)
    .update(payload, "utf8")
    .digest("hex");
  const headers = {
    "x-jz-key-id": keyId,
    "x-jz-timestamp": String(timestamp),
    "x-jz-nonce": nonce,
    "x-jz-subject-id": subjectId,
    "x-jz-role": role,
    "x-jz-signature": signature,
  };
  if (employeeKind) headers["x-jz-employee-kind"] = employeeKind;
  return headers;
}

async function timedReq(method, pathname, { body, actor, query } = {}) {
  const url = new URL(pathname, base);
  if (query) {
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  }
  const buf =
    body === undefined
      ? Buffer.alloc(0)
      : Buffer.from(JSON.stringify(body), "utf8");
  const headers = {
    ...sign({
      method,
      url,
      body: buf,
      subjectId: actor.subjectId,
      role: actor.role,
      employeeKind: actor.employeeKind,
    }),
  };
  if (body !== undefined) headers["content-type"] = "application/json";
  const t0 = performance.now();
  const res = await fetch(url, {
    method,
    headers,
    body: buf.byteLength ? buf : undefined,
  });
  const text = await res.text();
  const t1 = performance.now();
  return {
    method,
    path: pathname + (url.search || ""),
    status: res.status,
    ms: Math.round((t1 - t0) * 10) / 10,
    bytes: Buffer.byteLength(text),
    ok: res.status < 400,
  };
}

async function login(email, password) {
  const r = await timedReq("POST", "/auth/login", {
    body: { email, password },
    actor: gateway,
  });
  if (!r.ok) throw new Error(`login ${email} ${r.status}`);
  // need subject - re-login properly
  const url = new URL("/auth/login", base);
  const body = Buffer.from(JSON.stringify({ email, password }), "utf8");
  const headers = {
    ...sign({
      method: "POST",
      url,
      body,
      subjectId: gateway.subjectId,
      role: gateway.role,
      employeeKind: null,
    }),
    "content-type": "application/json",
  };
  const res = await fetch(url, { method: "POST", headers, body });
  const json = await res.json();
  return {
    subjectId: json.data.subject.subjectId,
    role: json.data.subject.role,
    employeeKind: json.data.subject.employeeKind ?? null,
    sessionToken: json.data.sessionToken,
  };
}

async function measureBootstrap(label, fn) {
  const calls = [];
  const wrap = async (method, pathname, opts) => {
    const r = await timedReq(method, pathname, opts);
    calls.push(r);
    return r;
  };
  const t0 = performance.now();
  await fn(wrap);
  const wallMs = Math.round((performance.now() - t0) * 10) / 10;
  const bytes = calls.reduce((s, c) => s + c.bytes, 0);
  const avg = calls.length
    ? Math.round((calls.reduce((s, c) => s + c.ms, 0) / calls.length) * 10) / 10
    : 0;
  const max = calls.length ? Math.max(...calls.map((c) => c.ms)) : 0;
  return {
    label,
    wallMs,
    requests: calls.length,
    totalPayloadBytes: bytes,
    avgHandlerMs: avg,
    maxHandlerMs: max,
    calls,
  };
}

async function main() {
  const admin = await login("admin@jumpifzero.example", "DevAdminPass1!");
  const client = await login("client@jumpifzero.example", "DevClientPass1!");
  const sales = await login("sales@jumpifzero.example", "DevSalesPass1!");
  const delivery = await login(
    "delivery@jumpifzero.example",
    "DevDeliveryPass1!",
  );

  const sessionValidate = await measureBootstrap("session.validate x1", async (req) => {
    await req("POST", "/auth/session/validate", {
      actor: gateway,
      body: { sessionToken: admin.sessionToken },
    });
  });

  const hmacMicro = [];
  for (let i = 0; i < 20; i++) {
    const r = await timedReq("GET", "/health/live", { actor: gateway });
    hmacMicro.push(r.ms);
  }

  const results = [];
  results.push(sessionValidate);
  results.push({
    label: "health.live x20 (HMAC+middleware baseline)",
    wallMs: hmacMicro.reduce((a, b) => a + b, 0),
    requests: 20,
    avgHandlerMs: Math.round((hmacMicro.reduce((a, b) => a + b, 0) / 20) * 10) / 10,
    maxHandlerMs: Math.max(...hmacMicro),
    samples: hmacMicro,
  });

  results.push(
    await measureBootstrap("admin.overview bootstrap", async (req) => {
      await Promise.all([
        req("GET", "/content/services", { actor: admin, query: { limit: "100" } }),
        req("GET", "/content/portfolio", { actor: admin, query: { limit: "100" } }),
        req("GET", "/content/blog", { actor: admin, query: { limit: "100" } }),
        req("GET", "/content/faqs", { actor: admin, query: { limit: "100" } }),
        req("GET", "/content/callbacks", { actor: admin, query: { limit: "100" } }),
        req("GET", "/clients", { actor: admin, query: { limit: "100" } }),
        req("GET", "/projects", { actor: admin, query: { limit: "100" } }),
      ]);
    }),
  );

  results.push(
    await measureBootstrap("admin.cms-catalog bootstrap", async (req) => {
      await Promise.all([
        req("GET", "/content/services", { actor: admin, query: { limit: "100" } }),
        req("GET", "/content/portfolio", { actor: admin, query: { limit: "100" } }),
        req("GET", "/content/blog", { actor: admin, query: { limit: "100" } }),
        req("GET", "/content/faqs", { actor: admin, query: { limit: "100" } }),
      ]);
    }),
  );

  results.push(
    await measureBootstrap("admin.ops bootstrap", async (req) => {
      const clientsRes = await timedReq("GET", "/clients", {
        actor: admin,
        query: { limit: "100" },
      });
      // parse via another call recording manually
      const clientsBody = await (async () => {
        const url = new URL("/clients", base);
        url.searchParams.set("limit", "100");
        const buf = Buffer.alloc(0);
        const headers = sign({
          method: "GET",
          url,
          body: buf,
          subjectId: admin.subjectId,
          role: admin.role,
          employeeKind: null,
        });
        const res = await fetch(url, { method: "GET", headers });
        return res.json();
      })();
      const items = clientsBody.data.items;
      await Promise.all([
        req("GET", "/content/services", { actor: admin, query: { limit: "100" } }),
        req("GET", "/employees", { actor: admin, query: { limit: "100" } }),
        req("GET", "/invoices", { actor: admin, query: { limit: "100" } }),
        req("GET", "/projects", { actor: admin, query: { limit: "100" } }),
        ...items.map((c) =>
          req("GET", `/clients/${c.id}`, { actor: admin }),
        ),
        ...items.map((c) =>
          req("GET", "/messages", {
            actor: admin,
            query: { limit: "100", clientId: c.id },
          }),
        ),
        ...items.map((c) =>
          req("GET", "/files", {
            actor: admin,
            query: { limit: "100", clientId: c.id },
          }),
        ),
      ]);
      void clientsRes;
    }),
  );

  results.push(
    await measureBootstrap("admin.crm-sales bootstrap", async (req) => {
      await Promise.all([
        req("GET", "/sales", { actor: admin, query: { limit: "100" } }),
        req("GET", "/employees", { actor: admin, query: { limit: "100" } }),
      ]);
    }),
  );

  results.push(
    await measureBootstrap("admin.crm-leads bootstrap", async (req) => {
      const leadsJson = await (async () => {
        const url = new URL("/leads", base);
        url.searchParams.set("limit", "100");
        const buf = Buffer.alloc(0);
        const headers = sign({
          method: "GET",
          url,
          body: buf,
          subjectId: admin.subjectId,
          role: admin.role,
          employeeKind: null,
        });
        const res = await fetch(url, { method: "GET", headers });
        return res.json();
      })();
      const leads = leadsJson.data.items;
      await Promise.all([
        req("GET", "/leads", { actor: admin, query: { limit: "100" } }),
        req("GET", "/employees", { actor: admin, query: { limit: "100" } }),
        ...leads.map((l) =>
          req("GET", "/lead-follow-ups", {
            actor: admin,
            query: { limit: "100", leadId: l.id },
          }),
        ),
      ]);
    }),
  );

  results.push(
    await measureBootstrap("admin.security bootstrap", async () => {}),
  );

  results.push(
    await measureBootstrap("customer.home bootstrap", async (req) => {
      const me = await (async () => {
        const url = new URL("/clients/me", base);
        const buf = Buffer.alloc(0);
        const headers = sign({
          method: "GET",
          url,
          body: buf,
          subjectId: client.subjectId,
          role: client.role,
          employeeKind: null,
        });
        const res = await fetch(url, { method: "GET", headers });
        return res.json();
      })();
      const clientId = me.data.id;
      await Promise.all([
        req("GET", "/clients/me", { actor: client }),
        req("GET", "/users/me", { actor: client }),
        req("GET", "/projects", {
          actor: client,
          query: { limit: "100", clientId },
        }),
        req("GET", "/invoices", {
          actor: client,
          query: { limit: "100", clientId },
        }),
        req("GET", "/messages", {
          actor: client,
          query: { limit: "100", clientId },
        }),
        req("GET", "/files", {
          actor: client,
          query: { limit: "100", clientId },
        }),
      ]);
    }),
  );

  results.push(
    await measureBootstrap("customer.profile bootstrap", async (req) => {
      await Promise.all([
        req("GET", "/clients/me", { actor: client }),
        req("GET", "/users/me", { actor: client }),
      ]);
    }),
  );

  results.push(
    await measureBootstrap("employee.sales full CRM bootstrap", async (req) => {
      const leadsJson = await (async () => {
        const url = new URL("/leads", base);
        url.searchParams.set("limit", "100");
        const buf = Buffer.alloc(0);
        const headers = sign({
          method: "GET",
          url,
          body: buf,
          subjectId: sales.subjectId,
          role: sales.role,
          employeeKind: sales.employeeKind,
        });
        const res = await fetch(url, { method: "GET", headers });
        return res.json();
      })();
      const leads = leadsJson.data?.items ?? [];
      await Promise.all([
        req("GET", "/sales", { actor: sales, query: { limit: "100" } }),
        req("GET", "/leads", { actor: sales, query: { limit: "100" } }),
        req("GET", "/employees", { actor: sales, query: { limit: "100" } }),
        req("GET", "/sales-messages", { actor: sales, query: { limit: "100" } }),
        ...leads.map((l) =>
          req("GET", "/lead-follow-ups", {
            actor: sales,
            query: { limit: "100", leadId: l.id },
          }),
        ),
      ]);
    }),
  );

  results.push(
    await measureBootstrap("employee.delivery bootstrap", async (req) => {
      const clientsRes = await req("GET", "/clients", {
        actor: delivery,
        query: { limit: "100" },
      });
      const clientsJson = await (async () => {
        const url = new URL("/clients", base);
        url.searchParams.set("limit", "100");
        const buf = Buffer.alloc(0);
        const headers = sign({
          method: "GET",
          url,
          body: buf,
          subjectId: delivery.subjectId,
          role: delivery.role,
          employeeKind: delivery.employeeKind,
        });
        const res = await fetch(url, { method: "GET", headers });
        return res.json();
      })();
      const items = clientsJson.data?.items ?? [];
      const empList = await req("GET", "/employees", {
        actor: delivery,
        query: { limit: "100" },
      });
      void empList;
      void clientsRes;
      // Match frontend: GET /employees/:id for self — discover id from list when allowed
      const employeesJson = await (async () => {
        const url = new URL("/employees", base);
        url.searchParams.set("limit", "100");
        const buf = Buffer.alloc(0);
        const headers = sign({
          method: "GET",
          url,
          body: buf,
          subjectId: delivery.subjectId,
          role: delivery.role,
          employeeKind: delivery.employeeKind,
        });
        const res = await fetch(url, { method: "GET", headers });
        return res.json();
      })();
      const self = (employeesJson.data?.items ?? []).find(
        (row) => row.user?.id === delivery.subjectId,
      );
      await Promise.all([
        self
          ? req("GET", `/employees/${self.id}`, { actor: delivery })
          : Promise.resolve(),
        req("GET", "/projects", { actor: delivery, query: { limit: "100" } }),
        ...items.map((c) =>
          req("GET", "/messages", {
            actor: delivery,
            query: { limit: "100", clientId: c.id },
          }),
        ),
        ...items.map((c) =>
          req("GET", "/files", {
            actor: delivery,
            query: { limit: "100", clientId: c.id },
          }),
        ),
      ]);
    }),
  );

  const outPath = path.join(root, "backend", "scripts", "perf-audit-api-results.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results.map(({ calls, samples, ...r }) => ({
    ...r,
    slowest: (calls ?? [])
      .slice()
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 5)
      .map((c) => `${c.method} ${c.path} ${c.ms}ms ${c.bytes}B`),
  })), null, 2));
  console.log("wrote", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
