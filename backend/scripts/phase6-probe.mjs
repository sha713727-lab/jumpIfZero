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

async function req(method, pathname, { body, actor } = {}) {
  const url = new URL(pathname, base);
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
  const res = await fetch(url, {
    method,
    headers,
    body: buf.byteLength ? buf : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function login(email, password) {
  const result = await req("POST", "/auth/login", {
    body: { email, password },
    actor: gateway,
  });
  assert(
    result.status === 200,
    `login failed ${email}: ${result.status} ${JSON.stringify(result.json)}`,
  );
  const data = result.json.data;
  return {
    subjectId: data.subject.subjectId,
    role: data.subject.role,
    employeeKind: data.subject.employeeKind ?? null,
  };
}

async function main() {
  const admin = await login("admin@jumpifzero.example", "DevAdminPass1!");
  const delivery = await login(
    "delivery@jumpifzero.example",
    "DevDeliveryPass1!",
  );
  const sales = await login("sales@jumpifzero.example", "DevSalesPass1!");
  const client = await login("client@jumpifzero.example", "DevClientPass1!");

  const meDenied = await req("GET", "/clients/me", { actor: delivery });
  assert(meDenied.status === 403, `delivery clients/me ${meDenied.status}`);
  const salesDenied = await req("GET", "/clients/me", { actor: sales });
  assert(salesDenied.status === 403, `sales clients/me ${salesDenied.status}`);
  console.log("rbac.clients_me.non_client.denied ok");

  const own = await req("GET", "/clients/me", { actor: client });
  assert(
    own.status === 200,
    `client me ${own.status} ${JSON.stringify(own.json)}`,
  );
  let clientRow = own.json.data;
  console.log("client.me.get ok", clientRow.id);

  const beforeStatus = clientRow.statusCode;
  const beforePlan = clientRow.plan;
  const beforeMember = clientRow.memberSince;
  const forbiddenPatch = await req("PATCH", "/clients/me", {
    actor: client,
    body: {
      version: clientRow.version,
      company: clientRow.company,
      phone: clientRow.phone,
      clientContactTitle: clientRow.clientContactTitle,
      location: clientRow.location,
      statusCode: "paused",
      plan: "hacked",
      memberSince: "2000-01-01",
    },
  });
  assert(
    forbiddenPatch.status === 200,
    `extra fields should be ignored got ${forbiddenPatch.status}`,
  );
  clientRow = forbiddenPatch.json.data;
  assert(clientRow.statusCode === beforeStatus, "status must stay admin-owned");
  assert(clientRow.plan === beforePlan, "plan must stay admin-owned");
  assert(
    clientRow.memberSince === beforeMember,
    "memberSince must stay admin-owned",
  );
  console.log("client.me.mass_assignment.ignored ok");

  const selfPatch = await req("PATCH", "/clients/me", {
    actor: client,
    body: {
      version: clientRow.version,
      company: clientRow.company,
      phone: clientRow.phone,
      clientContactTitle: "Portal Contact",
      location: clientRow.location || "Lahore",
    },
  });
  assert(
    selfPatch.status === 200,
    `client self patch ${selfPatch.status} ${JSON.stringify(selfPatch.json)}`,
  );
  clientRow = selfPatch.json.data;
  assert(clientRow.clientContactTitle === "Portal Contact", "title updated");
  console.log("client.me.update ok", clientRow.version);

  const userMe = await req("GET", "/users/me", { actor: client });
  assert(userMe.status === 200, `users me ${userMe.status}`);
  const userPatch = await req("PATCH", "/users/me", {
    actor: client,
    body: {
      version: userMe.json.data.version,
      name: userMe.json.data.name,
      title: "Customer Lead",
    },
  });
  assert(userPatch.status === 200, `users me patch ${userPatch.status}`);
  console.log("users.me.update ok");

  const projects = await req(
    "GET",
    `/projects?limit=50&clientId=${clientRow.id}`,
    { actor: client },
  );
  assert(projects.status === 200, `projects ${projects.status}`);
  console.log("client.projects.list ok", projects.json.data.total);

  const invoices = await req(
    "GET",
    `/invoices?limit=50&clientId=${clientRow.id}`,
    { actor: client },
  );
  assert(invoices.status === 200, `invoices ${invoices.status}`);
  console.log("client.invoices.list ok", invoices.json.data.total);

  const msg = await req("POST", "/messages", {
    actor: client,
    body: { clientId: clientRow.id, body: `Phase6 probe ${Date.now()}` },
  });
  assert(msg.status === 201, `message create ${msg.status}`);
  console.log("client.message.create ok", msg.json.data.id);

  const deliveryClients = await req("GET", "/clients?limit=50", {
    actor: delivery,
  });
  assert(deliveryClients.status === 200, `delivery clients ${deliveryClients.status}`);
  console.log("delivery.clients.list ok", deliveryClients.json.data.total);

  const salesClients = await req("GET", "/clients?limit=50", { actor: sales });
  assert(
    salesClients.status === 403,
    `sales clients should 403 got ${salesClients.status}`,
  );
  console.log("rbac.sales.delivery_ops.denied ok");

  const salesCrm = await req("GET", "/sales?limit=10", { actor: sales });
  assert(salesCrm.status === 200, `sales crm ${salesCrm.status}`);
  console.log("sales.crm.access ok");

  const otherClientPatch = await req("PATCH", `/clients/${clientRow.id}`, {
    actor: client,
    body: {
      version: clientRow.version,
      company: "Hacked",
      phone: "",
      statusCode: "active",
      memberSince: clientRow.memberSince,
      clientContactTitle: "",
      location: "",
      plan: clientRow.plan,
    },
  });
  assert(
    otherClientPatch.status === 403,
    `client admin patch path ${otherClientPatch.status}`,
  );
  console.log("client.admin_patch.path.denied ok");

  console.log("PHASE6_PROBE_OK");
}

main().catch((err) => {
  console.error("PHASE6_PROBE_FAIL", err);
  process.exit(1);
});
