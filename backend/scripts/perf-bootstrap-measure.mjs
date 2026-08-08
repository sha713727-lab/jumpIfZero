import { createHash, createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

let requestCount = 0;
let handlerMsTotal = 0;

async function req(method, pathname, { body, actor, query } = {}) {
  const url = new URL(pathname, base);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
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
  const started = performance.now();
  const res = await fetch(url, {
    method,
    headers,
    body: buf.byteLength ? buf : undefined,
  });
  const text = await res.text();
  const elapsed = performance.now() - started;
  requestCount += 1;
  handlerMsTotal += elapsed;
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (res.status >= 400) {
    throw new Error(
      `${method} ${pathname} -> ${res.status} ${JSON.stringify(json)}`,
    );
  }
  return { status: res.status, json, elapsed };
}

async function login(email, password) {
  const result = await req("POST", "/auth/login", {
    body: { email, password },
    actor: gateway,
  });
  const data = result.json.data;
  return {
    subjectId: data.subject.subjectId,
    role: data.subject.role,
    employeeKind: data.subject.employeeKind ?? null,
  };
}

function resetCounters() {
  requestCount = 0;
  handlerMsTotal = 0;
}

async function measure(label, fn) {
  resetCounters();
  const started = performance.now();
  await fn();
  const wallMs = performance.now() - started;
  return {
    label,
    requests: requestCount,
    wallMs: Math.round(wallMs),
    avgHandlerMs: requestCount === 0 ? 0 : Math.round(handlerMsTotal / requestCount),
  };
}

async function list(actor, pathname, query = { limit: "100" }) {
  const result = await req("GET", pathname, { actor, query });
  return result.json.data.items ?? [];
}

async function beforeFullAdminBootstrap(admin) {
  const [services, employees, clientsList, invoices] = await Promise.all([
    list(admin, "/content/services"),
    list(admin, "/employees"),
    list(admin, "/clients"),
    list(admin, "/invoices"),
  ]);
  const clientIds = clientsList.map((row) => row.id);
  const [projects, messagesBatches, filesBatches, sales, leads, portfolio, blog, faqs, team, contact, callbacks] =
    await Promise.all([
      list(admin, "/projects"),
      Promise.all(
        clientIds.map((clientId) =>
          list(admin, "/messages", { limit: "100", clientId }),
        ),
      ),
      Promise.all(
        clientIds.map((clientId) =>
          list(admin, "/files", { limit: "100", clientId }),
        ),
      ),
      list(admin, "/sales"),
      list(admin, "/leads"),
      list(admin, "/content/portfolio"),
      list(admin, "/content/blog"),
      list(admin, "/content/faqs"),
      list(admin, "/content/team"),
      list(admin, "/content/contact-messages"),
      list(admin, "/content/callbacks"),
    ]);
  await Promise.all(
    clientsList.map((row) => req("GET", `/clients/${row.id}`, { actor: admin })),
  );
  const leadIds = leads.map((row) => row.id);
  await Promise.all([
    ...leadIds.map((leadId) =>
      list(admin, "/lead-follow-ups", { limit: "100", leadId }),
    ),
    list(admin, "/sales-messages"),
  ]);
  void services;
  void employees;
  void invoices;
  void projects;
  void messagesBatches;
  void filesBatches;
  void sales;
  void portfolio;
  void blog;
  void faqs;
  void team;
  void contact;
  void callbacks;
}

async function afterOverview(admin) {
  await Promise.all([
    list(admin, "/content/services"),
    list(admin, "/content/portfolio"),
    list(admin, "/content/blog"),
    list(admin, "/content/faqs"),
    list(admin, "/content/callbacks"),
    list(admin, "/clients"),
    list(admin, "/projects"),
  ]);
}

async function afterCmsCatalog(admin) {
  await Promise.all([
    list(admin, "/content/services"),
    list(admin, "/content/portfolio"),
    list(admin, "/content/blog"),
    list(admin, "/content/faqs"),
  ]);
}

async function afterContact(admin) {
  await list(admin, "/content/contact-messages");
}

async function afterSecurity() {
  return;
}

async function afterCrmSales(admin) {
  await Promise.all([list(admin, "/sales"), list(admin, "/employees")]);
}

async function afterOps(admin) {
  const [services, employees, clientsList, invoices] = await Promise.all([
    list(admin, "/content/services"),
    list(admin, "/employees"),
    list(admin, "/clients"),
    list(admin, "/invoices"),
  ]);
  const clientIds = clientsList.map((row) => row.id);
  await Promise.all([
    list(admin, "/projects"),
    ...clientIds.map((clientId) =>
      list(admin, "/messages", { limit: "100", clientId }),
    ),
    ...clientIds.map((clientId) =>
      list(admin, "/files", { limit: "100", clientId }),
    ),
    ...clientsList.map((row) =>
      req("GET", `/clients/${row.id}`, { actor: admin }),
    ),
  ]);
  void services;
  void employees;
  void invoices;
}

async function afterCustomerProfile(client) {
  await Promise.all([
    req("GET", "/clients/me", { actor: client }),
    req("GET", "/users/me", { actor: client }),
  ]);
}

async function afterCustomerHome(client) {
  const [own] = await Promise.all([
    req("GET", "/clients/me", { actor: client }),
    req("GET", "/users/me", { actor: client }),
  ]);
  const clientId = own.json.data.id;
  await Promise.all([
    list(client, "/projects", { limit: "100", clientId }),
    list(client, "/invoices", { limit: "100", clientId }),
    list(client, "/messages", { limit: "100", clientId }),
    list(client, "/files", { limit: "100", clientId }),
  ]);
}

async function beforeCustomerHome(client) {
  const own = await req("GET", "/clients/me", { actor: client });
  await req("GET", "/users/me", { actor: client });
  const clientId = own.json.data.id;
  await Promise.all([
    list(client, "/projects", { limit: "100", clientId }),
    list(client, "/invoices", { limit: "100", clientId }),
    list(client, "/messages", { limit: "100", clientId }),
    list(client, "/files", { limit: "100", clientId }),
  ]);
}

async function main() {
  resetCounters();
  const admin = await login("admin@jumpifzero.example", "DevAdminPass1!");
  const client = await login("client@jumpifzero.example", "DevClientPass1!");
  console.log("login ok");

  const results = [];
  results.push(await measure("BEFORE admin any-page bootstrap", () => beforeFullAdminBootstrap(admin)));
  results.push(await measure("AFTER admin overview", () => afterOverview(admin)));
  results.push(await measure("AFTER admin cms-catalog", () => afterCmsCatalog(admin)));
  results.push(await measure("AFTER admin contact", () => afterContact(admin)));
  results.push(await measure("AFTER admin security", () => afterSecurity()));
  results.push(await measure("AFTER admin crm-sales", () => afterCrmSales(admin)));
  results.push(await measure("AFTER admin ops", () => afterOps(admin)));
  results.push(await measure("BEFORE customer home (serial me)", () => beforeCustomerHome(client)));
  results.push(await measure("AFTER customer home (parallel me)", () => afterCustomerHome(client)));
  results.push(await measure("AFTER customer profile", () => afterCustomerProfile(client)));

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
