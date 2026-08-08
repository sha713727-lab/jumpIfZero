import { createHash, createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

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
const results = [];

function log(section, check, status, detail = "") {
  const line = `${section} | ${check} | ${status}${detail ? ` | ${detail}` : ""}`;
  results.push(line);
  console.log(line);
}

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
    env.HMAC_KEY_ID,
  ].join("\n");
  const headers = {
    "x-jz-key-id": env.HMAC_KEY_ID,
    "x-jz-timestamp": String(timestamp),
    "x-jz-nonce": nonce,
    "x-jz-subject-id": subjectId,
    "x-jz-role": role,
    "x-jz-signature": createHmac("sha256", env.HMAC_SECRET)
      .update(payload, "utf8")
      .digest("hex"),
  };
  if (employeeKind) headers["x-jz-employee-kind"] = employeeKind;
  return headers;
}

async function req(method, pathname, { body, actor, signed = true } = {}) {
  const url = new URL(pathname, base);
  const buf =
    body === undefined
      ? Buffer.alloc(0)
      : Buffer.from(JSON.stringify(body), "utf8");
  const headers = {};
  if (signed && actor) {
    Object.assign(
      headers,
      sign({
        method,
        url,
        body: buf,
        subjectId: actor.subjectId,
        role: actor.role,
        employeeKind: actor.employeeKind,
      }),
    );
  }
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
  assert(result.status === 200, `login ${email} ${result.status}`);
  return {
    subjectId: result.json.data.subject.subjectId,
    role: result.json.data.subject.role,
    employeeKind: result.json.data.subject.employeeKind ?? null,
  };
}

function stamp() {
  return String(Date.now());
}

async function main() {
  const pool = new pg.Pool({
    host: env.DATABASE_HOST,
    port: Number(env.DATABASE_PORT),
    database: env.DATABASE_NAME,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
  });

  const admin = await login("admin@jumpifzero.example", "DevAdminPass1!");
  const delivery = await login(
    "delivery@jumpifzero.example",
    "DevDeliveryPass1!",
  );
  const sales = await login("sales@jumpifzero.example", "DevSalesPass1!");
  const sales2 = await login("sales2@jumpifzero.example", "DevSalesPass1!");
  const client = await login("client@jumpifzero.example", "DevClientPass1!");
  log("AUTH", "login admin/delivery/sales/sales2/client", 200, "ok");

  const noHmac = await req("GET", "/sales?limit=1", {
    actor: admin,
    signed: false,
  });
  log("SECURITY", "HMAC missing", noHmac.status, "expect 401");
  assert(noHmac.status === 401, `hmac ${noHmac.status}`);

  const badGateway = await req("GET", "/sales?limit=1", {
    actor: {
      subjectId: env.HMAC_GATEWAY_SUBJECT_ID,
      role: "gateway",
      employeeKind: null,
    },
  });
  log("SECURITY", "anonymous/gateway CRM", badGateway.status, "expect 401/403");
  assert(
    badGateway.status === 401 || badGateway.status === 403,
    `anon ${badGateway.status}`,
  );

  for (const [name, actor] of [
    ["delivery", delivery],
    ["client", client],
  ]) {
    for (const path of [
      "/carriers?limit=1",
      "/parties?limit=1",
      "/sales?limit=1",
      "/leads?limit=1",
      "/sales-messages?limit=1",
    ]) {
      const r = await req("GET", path, { actor });
      log("RBAC", `${name} ${path}`, r.status, "expect 403");
      assert(r.status === 403, `${name} ${path} ${r.status}`);
    }
  }

  const s = stamp();
  const carrierCreate = await req("POST", "/carriers", {
    actor: admin,
    body: {
      usDot: `8${s.slice(-6)}`,
      mc: `MC8${s.slice(-5)}`,
      legalName: `Verify Carrier ${s}`,
      dba: "VC",
      businessAddress: "1 Verify Rd",
      ownerOperatorDriver: "Driver V",
      taxId: "98-7654321",
      businessTelephone: "+1-555-1000",
    },
  });
  log("CARRIERS", "create", carrierCreate.status, carrierCreate.json?.data?.id);
  assert(carrierCreate.status === 201, `carrier create ${carrierCreate.status}`);
  let carrier = carrierCreate.json.data;
  assert(
    carrier.taxIdMasked && !String(carrier.taxIdMasked).includes("98-7654321"),
    "carrier create must mask tax",
  );
  assert(carrier.taxId === undefined, "no plaintext tax on create response");

  const carrierGet = await req("GET", `/carriers/${carrier.id}`, {
    actor: sales,
  });
  log("CARRIERS", "read", carrierGet.status, carrierGet.json?.data?.taxIdMasked);
  assert(carrierGet.status === 200, `carrier get ${carrierGet.status}`);
  assert(
    carrierGet.json.data.taxId === undefined,
    "detail must not include plaintext taxId",
  );

  const carrierPatch = await req("PATCH", `/carriers/${carrier.id}`, {
    actor: sales,
    body: {
      version: carrier.version,
      usDot: carrier.usDot,
      mc: carrier.mc,
      legalName: `${carrier.legalName} Updated`,
      dba: carrier.dba,
      businessAddress: carrier.businessAddress,
      ownerOperatorDriver: carrier.ownerOperatorDriver,
      businessTelephone: "+1-555-1001",
    },
  });
  log("CARRIERS", "update", carrierPatch.status, `v${carrierPatch.json?.data?.version}`);
  assert(carrierPatch.status === 200, `carrier patch ${carrierPatch.status}`);
  carrier = carrierPatch.json.data;

  const carrierConflict = await req("PATCH", `/carriers/${carrier.id}`, {
    actor: admin,
    body: {
      version: carrier.version - 1,
      usDot: carrier.usDot,
      mc: carrier.mc,
      legalName: "Conflict",
      dba: "",
      businessAddress: "",
      ownerOperatorDriver: "",
      businessTelephone: "",
    },
  });
  log("CARRIERS", "version conflict", carrierConflict.status, "expect 409");
  assert(carrierConflict.status === 409, `carrier 409 ${carrierConflict.status}`);

  const carrierSearch = await req(
    "GET",
    `/carriers?limit=5&offset=0&q=${encodeURIComponent("Verify Carrier")}&sort=legal_name&dir=asc`,
    { actor: admin },
  );
  log(
    "CARRIERS",
    "search/sort/pagination",
    carrierSearch.status,
    `total=${carrierSearch.json?.data?.total}`,
  );
  assert(carrierSearch.status === 200, `carrier search ${carrierSearch.status}`);
  assert(
    carrierSearch.json.data.items.every((i) => i.taxId === undefined),
    "list masked only",
  );

  const partyIns = await req("POST", "/parties", {
    actor: sales,
    body: {
      kind: "insurance",
      name: `Verify Ins ${s}`,
      phone: "+1-555-2000",
      street: "10 Ins",
      cityStateZip: "Dallas, TX",
      email: "ins@verify.example",
    },
  });
  log("PARTIES", "create insurance", partyIns.status, partyIns.json?.data?.id);
  assert(partyIns.status === 201, `party ins ${partyIns.status}`);
  let partyI = partyIns.json.data;

  const partyFac = await req("POST", "/parties", {
    actor: sales,
    body: {
      kind: "factoring",
      name: `Verify Fact ${s}`,
      phone: "+1-555-2001",
      street: "20 Fact",
      cityStateZip: "Houston, TX",
      email: "fact@verify.example",
    },
  });
  log("PARTIES", "create factoring", partyFac.status, partyFac.json?.data?.id);
  assert(partyFac.status === 201, `party fac ${partyFac.status}`);
  let partyF = partyFac.json.data;

  const partyGet = await req("GET", `/parties/${partyI.id}`, { actor: admin });
  log("PARTIES", "read", partyGet.status, partyGet.json?.data?.name);
  assert(partyGet.status === 200, `party get ${partyGet.status}`);

  const partyPatch = await req("PATCH", `/parties/${partyI.id}`, {
    actor: admin,
    body: {
      version: partyI.version,
      name: `${partyI.name} U`,
      phone: partyI.phone,
      street: partyI.street,
      cityStateZip: partyI.cityStateZip,
      email: partyI.email,
    },
  });
  log("PARTIES", "update", partyPatch.status);
  assert(partyPatch.status === 200, `party patch ${partyPatch.status}`);
  partyI = partyPatch.json.data;

  const partyList = await req(
    "GET",
    `/parties?limit=5&offset=0&kind=insurance&q=Verify&sort=name&dir=asc`,
    { actor: sales },
  );
  log(
    "PARTIES",
    "search/filter/sort/pagination",
    partyList.status,
    `total=${partyList.json?.data?.total}`,
  );
  assert(partyList.status === 200, `party list ${partyList.status}`);

  const sheet = await req("POST", "/sales", {
    actor: sales,
    body: {
      usDot: `7${s.slice(-6)}`,
      mc: `MC7${s.slice(-5)}`,
      legalName: `Sheet Carrier ${s}`,
      dba: "Sheet",
      businessAddress: "9 Sheet St",
      ownerOperatorDriver: "Sheet Driver",
      taxId: "11-2233445",
      businessTelephone: "+1-555-3000",
      truckType: "Reefer",
      contactName: "C Name",
      contactPhone: "+1-555-3001",
      contactEmail: "c@sheet.example",
      truck: "Volvo",
      trailer: "53R",
      insuranceName: `Sheet Ins ${s}`,
      insurancePhone: "+1-555-3002",
      insuranceStreet: "Ins St",
      insuranceCityStateZip: "Austin, TX",
      insuranceEmail: "i@sheet.example",
      factoringName: `Sheet Fact ${s}`,
      factoringPhone: "+1-555-3003",
      factoringStreet: "Fact St",
      factoringCityStateZip: "Chicago, IL",
      factoringEmail: "f@sheet.example",
      amount: "2500.00",
      currency: "USD",
      statusCode: "draft",
    },
  });
  log("SALES", "sheet create", sheet.status, sheet.json?.data?.id);
  assert(sheet.status === 201, `sheet ${sheet.status} ${JSON.stringify(sheet.json)}`);
  let sale = sheet.json.data;
  assert(sale.carrierId, "carrierId set");
  assert(sale.insurancePartyId, "insurancePartyId set");
  assert(sale.factoringPartyId, "factoringPartyId set");
  assert(sale.amount === "2500.00" && sale.currency === "USD", "money fields");
  assert(sale.taxId === undefined, "no plaintext on sale");

  const fk = await pool.query(
    `SELECT s.id, s.carrier_id, s.insurance_party_id, s.factoring_party_id, s.rep_id,
            c.legal_name, ip.kind AS i_kind, fp.kind AS f_kind
     FROM sales s
     JOIN carriers c ON c.id = s.carrier_id
     JOIN parties ip ON ip.id = s.insurance_party_id
     JOIN parties fp ON fp.id = s.factoring_party_id
     WHERE s.id = $1`,
    [sale.id],
  );
  assert(fk.rows.length === 1, "sale row missing");
  assert(fk.rows[0].i_kind === "insurance" && fk.rows[0].f_kind === "factoring", "party kinds");
  log(
    "SALES",
    "transaction FK evidence",
    200,
    `carrier=${fk.rows[0].carrier_id} ins=${fk.rows[0].insurance_party_id} fact=${fk.rows[0].factoring_party_id} rep=${fk.rows[0].rep_id}`,
  );

  const saleGet = await req("GET", `/sales/${sale.id}`, { actor: sales });
  log("SALES", "read", saleGet.status);
  assert(saleGet.status === 200, `sale get ${saleGet.status}`);

  const sales2Denied = await req("GET", `/sales/${sale.id}`, { actor: sales2 });
  log("RBAC", "sales2 get other rep sale", sales2Denied.status, "expect 403");
  assert(sales2Denied.status === 403, `idor sale ${sales2Denied.status}`);

  const saleUpdate = await req("PATCH", `/sales/${sale.id}`, {
    actor: sales,
    body: {
      id: sale.id,
      version: sale.version,
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
      amount: "2750.25",
      currency: "PKR",
      statusCode: "quoted",
    },
  });
  log("SALES", "update", saleUpdate.status, saleUpdate.json?.data?.amount);
  assert(saleUpdate.status === 200, `sale update ${saleUpdate.status}`);
  const staleSaleVersion = sale.version;
  sale = saleUpdate.json.data;

  const saleConflict = await req("PATCH", `/sales/${sale.id}`, {
    actor: sales,
    body: {
      id: sale.id,
      version: staleSaleVersion,
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
      amount: "2800.00",
      currency: "USD",
      statusCode: "draft",
    },
  });
  log("SALES", "version conflict", saleConflict.status, "expect 409");
  assert(saleConflict.status === 409, `sale 409 ${saleConflict.status}`);

  const statusWon = await req("POST", `/sales/${sale.id}/status`, {
    actor: sales,
    body: { version: sale.version, statusCode: "won" },
  });
  log("SALES", "status any valid", statusWon.status, statusWon.json?.data?.statusCode);
  assert(statusWon.status === 200, `status ${statusWon.status}`);
  sale = statusWon.json.data;

  const salesList = await req(
    "GET",
    `/sales?limit=5&offset=0&status=won&q=Sheet&sort=amount&dir=desc`,
    { actor: sales },
  );
  log(
    "SALES",
    "search/filter/sort/pagination",
    salesList.status,
    `total=${salesList.json?.data?.total}`,
  );
  assert(salesList.status === 200, `sales list ${salesList.status}`);

  const leadCreate = await req("POST", "/leads", {
    actor: sales,
    body: {
      company: `Verify Lead ${s}`,
      contactName: "Lead C",
      phone: "+1-555-4000",
      email: "lead@verify.example",
      source: "verify",
      statusCode: "new",
      notes: "n",
    },
  });
  log("LEADS", "create", leadCreate.status, leadCreate.json?.data?.id);
  assert(leadCreate.status === 201, `lead ${leadCreate.status}`);
  let lead = leadCreate.json.data;

  const leadOther = await req("GET", `/leads/${lead.id}`, { actor: sales2 });
  log("RBAC", "sales2 get other lead", leadOther.status, "expect 403");
  assert(leadOther.status === 403, `lead idor ${leadOther.status}`);

  const leadGet = await req("GET", `/leads/${lead.id}`, { actor: sales });
  log("LEADS", "read", leadGet.status);
  assert(leadGet.status === 200, `lead get ${leadGet.status}`);

  const leadPatch = await req("PATCH", `/leads/${lead.id}`, {
    actor: sales,
    body: {
      id: lead.id,
      version: lead.version,
      company: lead.company,
      contactName: "Lead C2",
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      notes: "updated",
    },
  });
  log("LEADS", "update", leadPatch.status);
  assert(leadPatch.status === 200, `lead patch ${leadPatch.status}`);
  lead = leadPatch.json.data;

  const leadStatus = await req("POST", `/leads/${lead.id}/status`, {
    actor: sales,
    body: { version: lead.version, statusCode: "qualified" },
  });
  log("LEADS", "status", leadStatus.status, leadStatus.json?.data?.statusCode);
  assert(leadStatus.status === 200, `lead status ${leadStatus.status}`);
  lead = leadStatus.json.data;

  const leadsList = await req(
    "GET",
    `/leads?limit=5&offset=0&status=qualified&q=Verify&sort=company&dir=asc`,
    { actor: admin },
  );
  log(
    "LEADS",
    "search/filter/pagination",
    leadsList.status,
    `total=${leadsList.json?.data?.total}`,
  );
  assert(leadsList.status === 200, `leads list ${leadsList.status}`);

  const fu1 = await req("POST", "/lead-follow-ups", {
    actor: sales,
    body: {
      leadId: lead.id,
      occurredAt: new Date(Date.now() - 60_000).toISOString(),
      note: "first",
      outcome: "vm",
    },
  });
  const fu2 = await req("POST", "/lead-follow-ups", {
    actor: sales,
    body: {
      leadId: lead.id,
      occurredAt: new Date().toISOString(),
      note: "second",
      outcome: "connected",
    },
  });
  log("FOLLOWUPS", "create", fu2.status, `${fu1.json?.data?.id},${fu2.json?.data?.id}`);
  assert(fu1.status === 201 && fu2.status === 201, "follow-up create");

  const fuList = await req(
    "GET",
    `/lead-follow-ups?leadId=${lead.id}&limit=10&sort=occurred_at&dir=desc`,
    { actor: sales },
  );
  log(
    "FOLLOWUPS",
    "read/order",
    fuList.status,
    fuList.json?.data?.items?.map((i) => i.note).join(">"),
  );
  assert(fuList.status === 200, `fu list ${fuList.status}`);
  assert(
    fuList.json.data.items[0].note === "second",
    "ordering desc by occurred_at",
  );

  const fuPatch = await req("PATCH", `/lead-follow-ups/${fu1.json.data.id}`, {
    actor: sales,
    body: {
      occurredAt: fu1.json.data.occurredAt,
      note: "first-updated",
      outcome: "vm",
    },
  });
  log("FOLLOWUPS", "update", fuPatch.status);
  assert(fuPatch.status === 200, `fu patch ${fuPatch.status}`);

  const fuDel = await req("DELETE", `/lead-follow-ups/${fu1.json.data.id}`, {
    actor: sales,
  });
  log("FOLLOWUPS", "hard DELETE", fuDel.status, "expect 204");
  assert(fuDel.status === 204, `fu del ${fuDel.status}`);
  const fuGone = await pool.query(
    `SELECT COUNT(*)::int AS n FROM lead_follow_ups WHERE id = $1`,
    [fu1.json.data.id],
  );
  assert(fuGone.rows[0].n === 0, "follow-up still in DB");
  log("FOLLOWUPS", "postgres hard delete evidence", 200, "count=0");

  const empList = await req("GET", "/employees?limit=100&kind=sales", {
    actor: admin,
  });
  assert(empList.status === 200, `employees ${empList.status}`);
  const sales1Emp = empList.json.data.items.find(
    (e) => e.user?.email === "sales@jumpifzero.example",
  );
  const sales2Emp = empList.json.data.items.find(
    (e) => e.user?.email === "sales2@jumpifzero.example",
  );
  assert(sales1Emp && sales2Emp, "need both sales employees");

  const msg = await req("POST", "/sales-messages", {
    actor: sales,
    body: { toRepId: sales2Emp.id, body: `Verify msg ${s}` },
  });
  log("MESSAGES", "create", msg.status, msg.json?.data?.id);
  assert(msg.status === 201, `msg ${msg.status}`);
  const msgId = msg.json.data.id;

  const msgList = await req(
    "GET",
    `/sales-messages?limit=20&peerRepId=${sales2Emp.id}&sort=sent_at&dir=asc`,
    { actor: sales },
  );
  log(
    "MESSAGES",
    "conversation history",
    msgList.status,
    `total=${msgList.json?.data?.total}`,
  );
  assert(msgList.status === 200, `msg list ${msgList.status}`);
  assert(
    msgList.json.data.items.some((m) => m.id === msgId),
    "message missing from history",
  );

  const msgRead = await req("POST", `/sales-messages/${msgId}/read`, {
    actor: sales2,
  });
  log("MESSAGES", "read status", msgRead.status, msgRead.json?.data?.readAt);
  assert(msgRead.status === 200, `msg read ${msgRead.status}`);
  assert(msgRead.json.data.readAt !== null, "readAt not set");

  const msgDel = await req("DELETE", `/sales-messages/${msgId}`, {
    actor: sales,
  });
  log("MESSAGES", "hard DELETE", msgDel.status, "expect 204");
  assert(msgDel.status === 204, `msg del ${msgDel.status}`);
  const msgGone = await pool.query(
    `SELECT COUNT(*)::int AS n FROM sales_messages WHERE id = $1`,
    [msgId],
  );
  assert(msgGone.rows[0].n === 0, "message still in DB");
  log("MESSAGES", "postgres hard delete evidence", 200, "count=0");

  const revealDenied = await req("GET", `/carriers/${sale.carrierId}/tax-id`, {
    actor: delivery,
  });
  log("TAX", "delivery decrypt", revealDenied.status, "expect 403");
  assert(revealDenied.status === 403, `tax delivery ${revealDenied.status}`);

  const auditBefore = await pool.query(
    `SELECT COUNT(*)::int AS n FROM tax_id_access_audit WHERE carrier_id = $1`,
    [sale.carrierId],
  );

  const reveal = await req("GET", `/carriers/${sale.carrierId}/tax-id`, {
    actor: sales,
  });
  log("TAX", "sales decrypt", reveal.status, "plaintext redacted in log");
  assert(reveal.status === 200, `tax reveal ${reveal.status}`);
  assert(reveal.json.data.taxId === "11-2233445", "wrong plaintext");

  const revealAdmin = await req("GET", `/carriers/${sale.carrierId}/tax-id`, {
    actor: admin,
  });
  log("TAX", "admin decrypt", revealAdmin.status);
  assert(revealAdmin.status === 200, `tax admin ${revealAdmin.status}`);

  const auditAfter = await pool.query(
    `SELECT id, carrier_id, viewer_role, viewer_email, correlation_id, viewed_at
     FROM tax_id_access_audit
     WHERE carrier_id = $1
     ORDER BY viewed_at DESC
     LIMIT 5`,
    [sale.carrierId],
  );
  assert(
    auditAfter.rows.length >= auditBefore.rows[0].n + 2,
    "audit rows not created",
  );
  log(
    "TAX",
    "audit evidence",
    200,
    `rows=${auditAfter.rows.length} latest_role=${auditAfter.rows[0].viewer_role} email=${auditAfter.rows[0].viewer_email}`,
  );

  const logPlain = await pool.query(
    `SELECT COUNT(*)::int AS n FROM tax_id_access_audit
     WHERE carrier_id = $1 AND (
       CAST(viewer_email AS text) LIKE '%11-2233445%'
     )`,
    [sale.carrierId],
  );
  assert(logPlain.rows[0].n === 0, "plaintext leaked into audit email");
  log("TAX", "plaintext not in audit email fields", 200, "ok");

  const saleArch = await req("POST", `/sales/${sale.id}/archive`, {
    actor: sales,
    body: { version: sale.version },
  });
  log("SALES", "archive", saleArch.status);
  assert(saleArch.status === 200, `sale arch ${saleArch.status}`);
  sale = saleArch.json.data;

  const saleRest = await req("POST", `/sales/${sale.id}/restore`, {
    actor: admin,
    body: { version: sale.version },
  });
  log("SALES", "restore", saleRest.status);
  assert(saleRest.status === 200, `sale rest ${saleRest.status}`);
  sale = saleRest.json.data;

  const leadArch = await req("POST", `/leads/${lead.id}/archive`, {
    actor: sales,
    body: { version: lead.version },
  });
  log("LEADS", "archive", leadArch.status);
  assert(leadArch.status === 200, `lead arch ${leadArch.status}`);
  lead = leadArch.json.data;

  const leadRest = await req("POST", `/leads/${lead.id}/restore`, {
    actor: admin,
    body: { version: lead.version },
  });
  log("LEADS", "restore", leadRest.status);
  assert(leadRest.status === 200, `lead rest ${leadRest.status}`);

  const linkedPartyId = sale.factoringPartyId;
  const linkedParty = await req("GET", `/parties/${linkedPartyId}`, {
    actor: admin,
  });
  assert(linkedParty.status === 200, `linked party ${linkedParty.status}`);

  const partyArch = await req("POST", `/parties/${linkedPartyId}/archive`, {
    actor: admin,
    body: { version: linkedParty.json.data.version },
  });
  log("PARTIES", "archive linked factoring", partyArch.status);
  assert(partyArch.status === 200, `party arch ${partyArch.status}`);

  const nullFk = await pool.query(
    `SELECT factoring_party_id FROM sales WHERE id = $1`,
    [sale.id],
  );
  assert(
    nullFk.rows[0].factoring_party_id === null,
    "factoring_party_id not SET NULL",
  );
  log(
    "PARTIES",
    "archive SET NULL evidence",
    200,
    `sale.factoring_party_id=${nullFk.rows[0].factoring_party_id}`,
  );

  const partyRest = await req("POST", `/parties/${linkedPartyId}/restore`, {
    actor: admin,
    body: { version: partyArch.json.data.version },
  });
  log("PARTIES", "restore", partyRest.status);
  assert(partyRest.status === 200, `party rest ${partyRest.status}`);

  const saleForCascade = await req("GET", `/sales/${sale.id}`, { actor: admin });
  assert(saleForCascade.status === 200, "sale before carrier cascade");
  const sheetCarrierId = saleForCascade.json.data.carrierId;
  const sheetCarrier = await req("GET", `/carriers/${sheetCarrierId}`, {
    actor: admin,
  });
  assert(sheetCarrier.status === 200, "sheet carrier get");

  const carrierArch = await req("POST", `/carriers/${sheetCarrierId}/archive`, {
    actor: admin,
    body: { version: sheetCarrier.json.data.version },
  });
  log("CARRIERS", "archive (cascade sales)", carrierArch.status);
  assert(carrierArch.status === 200, `carrier arch ${carrierArch.status}`);

  const cascaded = await pool.query(
    `SELECT archived_at IS NOT NULL AS archived FROM sales WHERE id = $1`,
    [sale.id],
  );
  assert(cascaded.rows[0].archived === true, "sale not cascaded on carrier archive");
  log(
    "CARRIERS",
    "archive cascade sales evidence",
    200,
    `sale.archived=${cascaded.rows[0].archived}`,
  );

  const carrierRest = await req("POST", `/carriers/${sheetCarrierId}/restore`, {
    actor: admin,
    body: { version: carrierArch.json.data.version },
  });
  log("CARRIERS", "restore", carrierRest.status);
  assert(carrierRest.status === 200, `carrier rest ${carrierRest.status}`);

  const standaloneCarrierArch = await req(
    "POST",
    `/carriers/${carrier.id}/archive`,
    {
      actor: admin,
      body: { version: carrier.version },
    },
  );
  log("CARRIERS", "archive standalone", standaloneCarrierArch.status);
  assert(
    standaloneCarrierArch.status === 200,
    `standalone carrier arch ${standaloneCarrierArch.status}`,
  );
  carrier = standaloneCarrierArch.json.data;

  const archivedFilter = await req(
    "GET",
    `/carriers?archived=archived&limit=10`,
    { actor: admin },
  );
  log(
    "CARRIERS",
    "filter archived",
    archivedFilter.status,
    `total=${archivedFilter.json?.data?.total}`,
  );
  assert(archivedFilter.status === 200, `archived filter ${archivedFilter.status}`);

  const zeroAmt = await req("POST", "/sales", {
    actor: sales,
    body: {
      usDot: `6${s.slice(-6)}`,
      mc: `MC6${s.slice(-5)}`,
      legalName: `Bad Amount ${s}`,
      taxId: "22-3344556",
      amount: "0",
      currency: "USD",
      statusCode: "draft",
    },
  });
  log("VALIDATION", "amount>0", zeroAmt.status, "expect 422");
  assert(zeroAmt.status === 422 || zeroAmt.status === 400, `amount0 ${zeroAmt.status}`);

  await pool.end();
  console.log("PHASE4_FINAL_VERIFY_OK");
  console.log(
    "IDS",
    JSON.stringify({
      carrierId: carrier.id,
      partyInsuranceId: partyI.id,
      partyFactoringId: partyF.id,
      saleId: sale.id,
      saleCarrierId: sheetCarrierId,
      saleInsurancePartyId: sale.insurancePartyId,
      saleFactoringPartyId: linkedPartyId,
      leadId: lead.id,
      followUpId: fu2.json.data.id,
    }),
  );
}

main().catch((err) => {
  console.error("PHASE4_FINAL_VERIFY_FAIL", err);
  process.exit(1);
});
