import { createHash, createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
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

async function req(method, pathname, { body, actor, raw = false } = {}) {
  const url = new URL(pathname, base);
  const buf =
    body === undefined
      ? Buffer.alloc(0)
      : Buffer.isBuffer(body)
        ? body
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
  if (body !== undefined && !Buffer.isBuffer(body)) {
    headers["content-type"] = "application/json";
  }
  const res = await fetch(url, {
    method,
    headers,
    body: buf.byteLength ? buf : undefined,
  });
  if (raw) {
    return { status: res.status, headers: res.headers, body: Buffer.from(await res.arrayBuffer()) };
  }
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
  const stamp = Date.now();
  const admin = await login("admin@jumpifzero.example", "DevAdminPass1!");
  const delivery = await login(
    "delivery@jumpifzero.example",
    "DevDeliveryPass1!",
  );
  const client = await login("client@jumpifzero.example", "DevClientPass1!");

  for (const [label, actor] of [
    ["delivery", delivery],
    ["client", client],
  ]) {
    const denied = await req("POST", "/content/services", {
      actor,
      body: {
        title: "x",
        slug: `deny-${stamp}`,
        description: "",
        path: "",
        imagePath: "",
        publishedAt: null,
      },
    });
    assert(denied.status === 403, `${label} CMS write should 403 got ${denied.status}`);
  }
  console.log("rbac.non_admin.cms_write.denied ok");

  const serviceCreate = await req("POST", "/content/services", {
    actor: admin,
    body: {
      title: `Probe Service ${stamp}`,
      slug: `probe-service-${stamp}`,
      description: "Probe description",
      path: "/services",
      imagePath: "/images/services/website.jpg",
      publishedAt: new Date().toISOString(),
    },
  });
  assert(
    serviceCreate.status === 201,
    `service create ${serviceCreate.status} ${JSON.stringify(serviceCreate.json)}`,
  );
  let service = serviceCreate.json.data;
  console.log("service.create ok", service.id);

  const serviceListGw = await req("GET", "/content/services?limit=10&publishedOnly=true", {
    actor: gateway,
  });
  assert(serviceListGw.status === 200, `gateway services list ${serviceListGw.status}`);
  assert(Array.isArray(serviceListGw.json.data.items), "services list items");
  console.log("service.list.gateway ok", serviceListGw.json.data.total);

  const serviceBySlug = await req(
    "GET",
    `/content/services/by-slug/${service.slug}`,
    { actor: gateway },
  );
  assert(serviceBySlug.status === 200, `service by slug ${serviceBySlug.status}`);
  console.log("service.by_slug ok");

  const serviceDup = await req("POST", "/content/services", {
    actor: admin,
    body: {
      title: "Dup",
      slug: service.slug,
      description: "",
      path: "",
      imagePath: "",
      publishedAt: null,
    },
  });
  assert(
    serviceDup.status === 409 || serviceDup.status === 422,
    `slug uniqueness ${serviceDup.status}`,
  );
  console.log("service.slug.unique ok", serviceDup.status);

  const servicePatch = await req("PATCH", `/content/services/${service.id}`, {
    actor: admin,
    body: {
      id: service.id,
      version: service.version,
      title: service.title,
      slug: service.slug,
      description: "Updated",
      path: service.path,
      imagePath: service.image_path,
      publishedAt: service.published_at,
    },
  });
  assert(servicePatch.status === 200, `service patch ${servicePatch.status}`);
  service = servicePatch.json.data;
  console.log("service.update ok", service.version);

  const portfolioCreate = await req("POST", "/content/portfolio", {
    actor: admin,
    body: {
      title: `Probe Portfolio ${stamp}`,
      slug: `probe-portfolio-${stamp}`,
      category: "Website Development",
      summary: "Probe summary",
      imagePath: "/images/services/website.jpg",
      publishedAt: new Date().toISOString(),
    },
  });
  assert(
    portfolioCreate.status === 201,
    `portfolio create ${portfolioCreate.status} ${JSON.stringify(portfolioCreate.json)}`,
  );
  let portfolio = portfolioCreate.json.data;
  console.log("portfolio.create ok", portfolio.id, portfolio.slug);

  const portfolioBySlug = await req(
    "GET",
    `/content/portfolio/by-slug/${portfolio.slug}`,
    { actor: gateway },
  );
  assert(portfolioBySlug.status === 200, `portfolio by slug ${portfolioBySlug.status}`);
  console.log("portfolio.by_slug ok");

  const blogCreate = await req("POST", "/content/blog", {
    actor: admin,
    body: {
      title: `Probe Blog ${stamp}`,
      slug: `probe-blog-${stamp}`,
      excerpt: "Excerpt",
      body: "Body content",
      imagePath: "/images/services/software.jpg",
      category: "Product",
      publishedAt: new Date().toISOString(),
    },
  });
  assert(blogCreate.status === 201, `blog create ${blogCreate.status}`);
  let blog = blogCreate.json.data;
  console.log("blog.create ok", blog.id);

  const blogBySlug = await req("GET", `/content/blog/by-slug/${blog.slug}`, {
    actor: gateway,
  });
  assert(blogBySlug.status === 200, `blog by slug ${blogBySlug.status}`);
  console.log("blog.by_slug ok");

  const faqA = await req("POST", "/content/faqs", {
    actor: admin,
    body: {
      question: `FAQ A ${stamp}`,
      answer: "Answer A",
      sortOrder: 10,
      publishedAt: new Date().toISOString(),
    },
  });
  const faqB = await req("POST", "/content/faqs", {
    actor: admin,
    body: {
      question: `FAQ B ${stamp}`,
      answer: "Answer B",
      sortOrder: 20,
      publishedAt: new Date().toISOString(),
    },
  });
  assert(faqA.status === 201 && faqB.status === 201, "faq create");
  let fa = faqA.json.data;
  let fb = faqB.json.data;
  console.log("faq.create ok");

  const faqReorder = await req("PUT", "/content/faqs/reorder", {
    actor: admin,
    body: {
      items: [
        { id: fa.id, sortOrder: 20, version: fa.version },
        { id: fb.id, sortOrder: 10, version: fb.version },
      ],
    },
  });
  assert(faqReorder.status === 204 || faqReorder.status === 200, `faq reorder ${faqReorder.status}`);
  console.log("faq.reorder ok");

  const teamCreate = await req("POST", "/content/team", {
    actor: admin,
    body: {
      name: `Probe Member ${stamp}`,
      roleTitle: "Engineer",
      bio: "Bio",
      imagePath: "/images/services/design.jpg",
      employeeId: null,
      sortOrder: 1,
      publishedAt: new Date().toISOString(),
      socials: [
        {
          network: "linkedin",
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/probe-example",
        },
      ],
    },
  });
  assert(
    teamCreate.status === 201,
    `team create ${teamCreate.status} ${JSON.stringify(teamCreate.json)}`,
  );
  let team = teamCreate.json.data;
  assert(Array.isArray(team.socials) && team.socials.length === 1, "team socials");
  console.log("team.create.socials ok", team.id);

  const contact = await req("POST", "/content/contact-messages", {
    actor: gateway,
    body: {
      name: "Probe Contact",
      email: "probe-contact@example.com",
      subject: "Hello",
      body: "Message body for probe",
    },
  });
  assert(
    contact.status === 201,
    `contact create ${contact.status} ${JSON.stringify(contact.json)}`,
  );
  let contactMsg = contact.json.data;
  assert(contactMsg.status_code === "new", "contact status new");
  console.log("contact.submit ok", contactMsg.id);

  const contactAdmin = await req("GET", "/content/contact-messages?limit=20", {
    actor: admin,
  });
  assert(contactAdmin.status === 200, `contact list ${contactAdmin.status}`);
  console.log("contact.list.admin ok", contactAdmin.json.data.total);

  const contactPatch = await req("PATCH", `/content/contact-messages/${contactMsg.id}`, {
    actor: admin,
    body: { id: contactMsg.id, version: contactMsg.version, status: "read" },
  });
  assert(contactPatch.status === 200, `contact patch ${contactPatch.status}`);
  contactMsg = contactPatch.json.data;
  console.log("contact.status ok", contactMsg.status_code);

  const callback = await req("POST", "/content/callbacks", {
    actor: gateway,
    body: {
      name: "Probe Callback",
      email: "probe-callback@example.com",
      phone: "+1-555-0199",
      note: "Please call",
    },
  });
  assert(callback.status === 201, `callback create ${callback.status}`);
  let cb = callback.json.data;
  console.log("callback.submit ok", cb.id);

  const callbackPatch = await req("PATCH", `/content/callbacks/${cb.id}`, {
    actor: admin,
    body: { id: cb.id, version: cb.version, status: "resolved" },
  });
  assert(callbackPatch.status === 200, `callback patch ${callbackPatch.status}`);
  console.log("callback.status ok");

  const archiveService = await req("DELETE", `/content/services/${service.id}`, {
    actor: admin,
    body: { version: service.version },
  });
  assert(
    archiveService.status === 204 || archiveService.status === 200,
    `service archive ${archiveService.status}`,
  );
  const restoreService = await req("POST", `/content/services/${service.id}/restore`, {
    actor: admin,
    body: { version: service.version + 1 },
  });
  assert(
    restoreService.status === 200 || restoreService.status === 204,
    `service restore ${restoreService.status} ${JSON.stringify(restoreService.json)}`,
  );
  console.log("service.archive_restore ok");

  const archivePortfolio = await req("DELETE", `/content/portfolio/${portfolio.id}`, {
    actor: admin,
    body: { version: portfolio.version },
  });
  assert(
    archivePortfolio.status === 204 || archivePortfolio.status === 200,
    `portfolio archive ${archivePortfolio.status}`,
  );
  const restorePortfolio = await req(
    "POST",
    `/content/portfolio/${portfolio.id}/restore`,
    { actor: admin, body: { version: portfolio.version + 1 } },
  );
  assert(
    restorePortfolio.status === 200 || restorePortfolio.status === 204,
    `portfolio restore ${restorePortfolio.status}`,
  );
  console.log("portfolio.archive_restore ok");

  const archiveBlog = await req("DELETE", `/content/blog/${blog.id}`, {
    actor: admin,
    body: { version: blog.version },
  });
  assert(archiveBlog.status === 204 || archiveBlog.status === 200, "blog archive");
  const restoreBlog = await req("POST", `/content/blog/${blog.id}/restore`, {
    actor: admin,
    body: { version: blog.version + 1 },
  });
  assert(
    restoreBlog.status === 200 || restoreBlog.status === 204,
    `blog restore ${restoreBlog.status}`,
  );
  console.log("blog.archive_restore ok");

  const badContact = await req("POST", "/content/contact-messages", {
    actor: gateway,
    body: { name: "", email: "bad", subject: "", body: "" },
  });
  assert(
    badContact.status === 422 || badContact.status === 400,
    `contact validation ${badContact.status}`,
  );
  console.log("contact.validation.fail ok", badContact.status);

  const search = await req(
    "GET",
    `/content/blog?limit=10&q=Probe%20Blog%20${stamp}&publishedOnly=false`,
    { actor: admin },
  );
  assert(search.status === 200, `blog search ${search.status}`);
  console.log("blog.search ok", search.json.data.total);

  console.log("PHASE5_PROBE_OK");
}

main().catch((err) => {
  console.error("PHASE5_PROBE_FAIL", err);
  process.exit(1);
});
