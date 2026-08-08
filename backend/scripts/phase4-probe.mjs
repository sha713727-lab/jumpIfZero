import { createHash, createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

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
    actor: {
      subjectId: env.HMAC_GATEWAY_SUBJECT_ID,
      role: "gateway",
      employeeKind: null,
    },
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

function sheetBody(overrides = {}) {
  const stamp = Date.now();
  return {
    usDot: `9${String(stamp).slice(-6)}`,
    mc: `MC-${String(stamp).slice(-6)}`,
    legalName: `Probe Carrier ${stamp}`,
    dba: "Probe DBA",
    businessAddress: "1 Probe St, Dallas, TX 75201",
    ownerOperatorDriver: "Probe Driver",
    taxId: "12-3456789",
    businessTelephone: "+1-555-0100",
    truckType: "Dry Van",
    contactName: "Probe Contact",
    contactPhone: "+1-555-0101",
    contactEmail: "probe@carrier.example",
    truck: "Freightliner",
    trailer: "53 Dry Van",
    insuranceName: "Probe Insurance",
    insurancePhone: "+1-555-0102",
    insuranceStreet: "10 Ins Way",
    insuranceCityStateZip: "Austin, TX 78701",
    insuranceEmail: "ins@probe.example",
    factoringName: "Probe Factoring",
    factoringPhone: "+1-555-0103",
    factoringStreet: "20 Fact Blvd",
    factoringCityStateZip: "Houston, TX 77002",
    factoringEmail: "fact@probe.example",
    amount: "1500.00",
    currency: "USD",
    statusCode: "draft",
    ...overrides,
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

  for (const [label, actor] of [
    ["delivery", delivery],
    ["client", client],
  ]) {
    const denied = await req("GET", "/sales?limit=10", { actor });
    assert(
      denied.status === 403,
      `${label} sales list should 403 got ${denied.status}`,
    );
  }
  console.log("rbac.delivery_client.denied ok");

  const zeroAmount = await req("POST", "/sales", {
    actor: sales,
    body: sheetBody({ amount: "0", currency: "USD" }),
  });
  assert(
    zeroAmount.status === 422 || zeroAmount.status === 400,
    `amount 0 should fail got ${zeroAmount.status}`,
  );
  console.log("sale.amount_gt_zero ok", zeroAmount.status);

  const create = await req("POST", "/sales", {
    actor: sales,
    body: sheetBody(),
  });
  assert(
    create.status === 201,
    `sale create ${create.status} ${JSON.stringify(create.json)}`,
  );
  const sale = create.json.data;
  assert(sale.amount === "1500.00", `amount ${sale.amount}`);
  assert(sale.currency === "USD", `currency ${sale.currency}`);
  assert(
    typeof sale.taxIdMasked === "string" && !sale.taxIdMasked.includes("12-3456789"),
    `tax should be masked got ${sale.taxIdMasked}`,
  );
  assert(sale.taxId === undefined, "plaintext taxId must not appear on sheet");
  console.log("sale.create ok", sale.id, sale.carrierId, sale.taxIdMasked);

  const list = await req("GET", "/sales?limit=50", { actor: sales });
  assert(list.status === 200, `sales list ${list.status}`);
  assert(
    list.json.data.items.every((item) => item.taxId === undefined),
    "list must not include plaintext taxId",
  );
  console.log("sale.list ok", list.json.data.total);

  const statusChange = await req("POST", `/sales/${sale.id}/status`, {
    actor: sales,
    body: { version: sale.version, statusCode: "won" },
  });
  assert(
    statusChange.status === 200,
    `status change ${statusChange.status} ${JSON.stringify(statusChange.json)}`,
  );
  assert(statusChange.json.data.statusCode === "won", "status should be won");
  console.log("sale.status.any_valid ok");

  const updateBody = {
    id: sale.id,
    version: statusChange.json.data.version,
    usDot: sale.usDot,
    mc: sale.mc,
    legalName: sale.legalName,
    dba: sale.dba,
    businessAddress: sale.businessAddress,
    ownerOperatorDriver: sale.ownerOperatorDriver,
    businessTelephone: sale.businessTelephone,
    truckType: sale.truckType,
    contactName: sale.contactName,
    contactPhone: sale.contactPhone,
    contactEmail: sale.contactEmail,
    truck: sale.truck,
    trailer: sale.trailer,
    insuranceName: sale.insuranceName,
    insurancePhone: sale.insurancePhone,
    insuranceStreet: sale.insuranceStreet,
    insuranceCityStateZip: sale.insuranceCityStateZip,
    insuranceEmail: sale.insuranceEmail,
    factoringName: sale.factoringName,
    factoringPhone: sale.factoringPhone,
    factoringStreet: sale.factoringStreet,
    factoringCityStateZip: sale.factoringCityStateZip,
    factoringEmail: sale.factoringEmail,
    amount: "1750.50",
    currency: "PKR",
    statusCode: "quoted",
  };
  const updated = await req("PATCH", `/sales/${sale.id}`, {
    actor: sales,
    body: updateBody,
  });
  assert(
    updated.status === 200,
    `sale update ${updated.status} ${JSON.stringify(updated.json)}`,
  );
  assert(updated.json.data.amount === "1750.50", "amount updated");
  assert(updated.json.data.currency === "PKR", "currency updated");
  console.log("sale.update.omit_taxId ok");

  const reveal = await req("GET", `/carriers/${sale.carrierId}/tax-id`, {
    actor: sales,
  });
  assert(
    reveal.status === 200,
    `tax reveal ${reveal.status} ${JSON.stringify(reveal.json)}`,
  );
  assert(reveal.json.data.taxId === "12-3456789", "plaintext taxId mismatch");
  console.log("tax.reveal ok");

  const pool = new pg.Pool({
    host: env.DATABASE_HOST,
    port: Number(env.DATABASE_PORT),
    database: env.DATABASE_NAME,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
  });
  const audit = await pool.query(
    `SELECT COUNT(*)::int AS n FROM tax_id_access_audit WHERE carrier_id = $1`,
    [sale.carrierId],
  );
  assert(audit.rows[0].n >= 1, "tax reveal must create audit row");
  console.log("tax.audit ok", audit.rows[0].n);

  const leadCreate = await req("POST", "/leads", {
    actor: sales,
    body: {
      company: `Probe Lead ${Date.now()}`,
      contactName: "Lead Contact",
      phone: "+1-555-0400",
      email: "lead@probe.example",
      source: "probe",
      statusCode: "new",
      notes: "phase4",
    },
  });
  assert(
    leadCreate.status === 201,
    `lead create ${leadCreate.status} ${JSON.stringify(leadCreate.json)}`,
  );
  const lead = leadCreate.json.data;
  console.log("lead.create ok", lead.id);

  const followUp = await req("POST", "/lead-follow-ups", {
    actor: sales,
    body: {
      leadId: lead.id,
      occurredAt: new Date().toISOString(),
      note: "Called",
      outcome: "connected",
    },
  });
  assert(
    followUp.status === 201,
    `follow-up create ${followUp.status} ${JSON.stringify(followUp.json)}`,
  );
  const followUpId = followUp.json.data.id;
  const delFollowUp = await req("DELETE", `/lead-follow-ups/${followUpId}`, {
    actor: sales,
  });
  assert(
    delFollowUp.status === 204 || delFollowUp.status === 200,
    `follow-up delete ${delFollowUp.status}`,
  );
  const gone = await pool.query(
    `SELECT COUNT(*)::int AS n FROM lead_follow_ups WHERE id = $1`,
    [followUpId],
  );
  assert(gone.rows[0].n === 0, "follow-up must be hard deleted");
  console.log("lead_follow_up.hard_delete ok");

  const employees = await req("GET", "/employees?limit=100&kind=sales", {
    actor: admin,
  });
  assert(employees.status === 200, `employees ${employees.status}`);
  const peer = employees.json.data.items.find(
    (item) => item.user?.email === "sales2@jumpifzero.example",
  );
  if (peer) {
    const msg = await req("POST", "/sales-messages", {
      actor: sales,
      body: { toRepId: peer.id, body: "Phase 4 probe message" },
    });
    assert(
      msg.status === 201,
      `sales message ${msg.status} ${JSON.stringify(msg.json)}`,
    );
    const msgId = msg.json.data.id;
    const delMsg = await req("DELETE", `/sales-messages/${msgId}`, {
      actor: sales,
    });
    assert(
      delMsg.status === 204 || delMsg.status === 200,
      `sales message delete ${delMsg.status}`,
    );
    const msgGone = await pool.query(
      `SELECT COUNT(*)::int AS n FROM sales_messages WHERE id = $1`,
      [msgId],
    );
    assert(msgGone.rows[0].n === 0, "sales message must be hard deleted");
    console.log("sales_message.hard_delete ok");
  } else {
    console.log("sales_message.skipped (sales2 not seeded)");
  }

  const archive = await req("POST", `/sales/${sale.id}/archive`, {
    actor: sales,
    body: { version: updated.json.data.version },
  });
  assert(
    archive.status === 200,
    `sale archive ${archive.status} ${JSON.stringify(archive.json)}`,
  );
  console.log("sale.archive ok");

  const parties = await req("GET", "/parties?limit=10", { actor: sales });
  assert(parties.status === 200, `parties ${parties.status}`);
  console.log("parties.list ok", parties.json.data.total);

  const carriers = await req("GET", "/carriers?limit=10", { actor: admin });
  assert(carriers.status === 200, `carriers ${carriers.status}`);
  assert(
    carriers.json.data.items.every(
      (item) => item.taxId === undefined && typeof item.taxIdMasked === "string",
    ),
    "carriers list must only expose masked tax id",
  );
  console.log("carriers.list.masked ok");

  await pool.end();
  console.log("PHASE4_PROBE_OK");
}

main().catch((err) => {
  console.error("PHASE4_PROBE_FAIL", err);
  process.exit(1);
});
