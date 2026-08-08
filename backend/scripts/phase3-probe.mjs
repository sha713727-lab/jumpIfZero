import { createHash, createHmac, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envPath = path.join(root, "backend", ".env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
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
const storageRoot = env.FILE_STORAGE_ROOT;

function sha256Hex(data) {
  return createHash("sha256").update(data).digest("hex");
}

function canonicalQuery(searchParams) {
  const pairs = [];
  const keys = [...new Set(searchParams.keys())].sort();
  for (const key of keys) {
    const values = searchParams.getAll(key).sort();
    for (const value of values) {
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

async function req(method, pathname, { body, actor, headers = {}, rawBody } = {}) {
  const url = new URL(pathname, base);
  const buf =
    rawBody !== undefined
      ? rawBody
      : body === undefined
        ? Buffer.alloc(0)
        : Buffer.from(JSON.stringify(body), "utf8");
  const h = {
    ...sign({
      method,
      url,
      body: buf,
      subjectId: actor.subjectId,
      role: actor.role,
      employeeKind: actor.employeeKind,
    }),
    ...headers,
  };
  if (body !== undefined && rawBody === undefined) {
    h["content-type"] = "application/json";
  }
  const res = await fetch(url, { method, headers: h, body: buf.byteLength ? buf : undefined });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json, headers: res.headers };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function login(email, password) {
  const gatewayId = env.HMAC_GATEWAY_SUBJECT_ID;
  const result = await req("POST", "/auth/login", {
    body: { email, password },
    actor: { subjectId: gatewayId, role: "gateway", employeeKind: null },
  });
  assert(result.status === 200, `login failed ${email}: ${result.status} ${JSON.stringify(result.json)}`);
  const data = result.json.data;
  console.log("login", email, JSON.stringify(data.subject));
  return {
    subjectId: data.subject.subjectId,
    role: data.subject.role,
    employeeKind: data.subject.employeeKind ?? null,
  };
}

async function main() {
  mkdirSync(storageRoot, { recursive: true });
  const admin = await login("admin@jumpifzero.example", "DevAdminPass1!");
  const delivery = await login("delivery@jumpifzero.example", "DevDeliveryPass1!");
  const sales = await login("sales@jumpifzero.example", "DevSalesPass1!");
  const client = await login("client@jumpifzero.example", "DevClientPass1!");

  const clients = await req("GET", "/clients?limit=50", { actor: admin });
  console.log("clients raw", clients.status, JSON.stringify(clients.json));
  assert(clients.status === 200, `clients list ${clients.status}`);
  assert(clients.json.data.total >= 1, "expected seeded client");
  const clientId = clients.json.data.items[0].id;
  console.log("clients.list ok", clients.json.data.total, clientId);

  const salesDenied = await req("GET", "/clients?limit=10", { actor: sales });
  assert(salesDenied.status === 403, `sales should be 403 got ${salesDenied.status}`);
  console.log("sales.denied ok");

  const projects = await req("GET", `/projects?limit=50&clientId=${clientId}`, { actor: delivery });
  assert(projects.status === 200, `projects ${projects.status}`);
  console.log("projects.list ok", projects.json.data.total);

  const invoices = await req("GET", `/invoices?limit=50&clientId=${clientId}`, { actor: admin });
  assert(invoices.status === 200, `invoices ${invoices.status}`);
  console.log("invoices.list ok", invoices.json.data.total);

  const messages = await req("GET", `/messages?limit=50&clientId=${clientId}`, { actor: client });
  assert(messages.status === 200, `messages ${messages.status}`);
  console.log("messages.list ok", messages.json.data.total);

  const noKey = await req("POST", "/invoices", {
    actor: admin,
    body: {
      clientId,
      number: `INV-PROBE-${Date.now()}`,
      title: "No key",
      amount: "10.00",
      currency: "USD",
      statusCode: "draft",
      billToCompany: "Probe Co",
      billToName: "Probe Contact",
      billToEmail: "probe@example.com",
      billToPhone: "",
      billToLocation: "",
      fromCompany: "JZ Enterprises",
      fromEmail: "ikram@jumpifzero.com",
      fromPhone: "03079222055",
    },
  });
  assert(noKey.status === 400, `idempotency required got ${noKey.status}`);
  console.log("invoice.idempotency.required ok");

  const invKey = randomUUID();
  const invBody = {
    clientId,
    number: `INV-PROBE-${Date.now()}`,
    title: "Probe invoice",
    amount: "99.50",
    currency: "USD",
    statusCode: "draft",
    billToCompany: "Probe Co",
    billToName: "Probe Contact",
    billToEmail: "probe@example.com",
    billToPhone: "555-0100",
    billToLocation: "Lahore",
    fromCompany: "JZ Enterprises",
    fromEmail: "ikram@jumpifzero.com",
    fromPhone: "03079222055",
  };
  const inv1 = await req("POST", "/invoices", {
    actor: admin,
    body: invBody,
    headers: { "Idempotency-Key": invKey },
  });
  assert(inv1.status === 201, `invoice create ${inv1.status} ${JSON.stringify(inv1.json)}`);
  const inv2 = await req("POST", "/invoices", {
    actor: admin,
    body: invBody,
    headers: { "Idempotency-Key": invKey },
  });
  assert(inv2.status === 201, `invoice replay ${inv2.status}`);
  assert(inv2.json.data.id === inv1.json.data.id, "idempotent replay mismatch");
  console.log("invoice.idempotency.replay ok", inv1.json.data.id);

  const msg = await req("POST", "/messages", {
    actor: admin,
    body: { clientId, body: "Phase 3 probe message" },
  });
  assert(msg.status === 201, `message create ${msg.status}`);
  const msgId = msg.json.data.id;
  const read = await req("POST", `/messages/${msgId}/read`, { actor: client });
  assert(read.status === 200, `message read ${read.status}`);
  console.log("messages.create/read ok");

  if (projects.json.data.items.length > 0) {
    const p = projects.json.data.items[0];
    const bad = await req("POST", `/projects/${p.id}/status`, {
      actor: admin,
      body: { version: p.version, statusCode: "requested" },
    });
    if (p.statusCode !== "requested") {
      assert(bad.status === 409, `backward transition should 409 got ${bad.status}`);
      console.log("project.status.forward-only ok");
    } else {
      console.log("project.status.skip (already requested)");
    }
  }

  const png = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082",
    "hex",
  );
  const boundary = "----jzprobe" + randomUUID().replaceAll("-", "");
  const uploadName = `probe-${randomUUID()}.png`;
  const parts = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="clientId"\r\n\r\n${clientId}\r\n`,
    ),
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${uploadName}"\r\nContent-Type: image/png\r\n\r\n`,
    ),
    png,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const upload = await req("POST", "/files", {
    actor: admin,
    rawBody: parts,
    headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
  });
  assert(upload.status === 201, `upload ${upload.status} ${JSON.stringify(upload.json)}`);
  const fileId = upload.json.data.id;
  const storageKeyHint = path.join(storageRoot, "uploads");
  assert(existsSync(storageRoot), "FILE_STORAGE_ROOT missing");
  console.log("files.upload ok", fileId, "root", storageRoot);

  const dl = await req("GET", `/files/${fileId}/download`, { actor: admin });
  assert(dl.status === 200, `download ${dl.status}`);
  console.log("files.download ok");

  const badMime = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
  const boundary2 = "----jzbad" + randomUUID().replaceAll("-", "");
  const badParts = Buffer.concat([
    Buffer.from(
      `--${boundary2}\r\nContent-Disposition: form-data; name="clientId"\r\n\r\n${clientId}\r\n`,
    ),
    Buffer.from(
      `--${boundary2}\r\nContent-Disposition: form-data; name="file"; filename="x.pdf"\r\nContent-Type: application/pdf\r\n\r\n`,
    ),
    badMime,
    Buffer.from(`\r\n--${boundary2}--\r\n`),
  ]);
  const badUpload = await req("POST", "/files", {
    actor: admin,
    rawBody: badParts,
    headers: { "content-type": `multipart/form-data; boundary=${boundary2}` },
  });
  assert(badUpload.status === 400, `bad mime should 400 got ${badUpload.status}`);
  console.log("files.mime.reject ok");

  console.log("PHASE3_PROBE_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
