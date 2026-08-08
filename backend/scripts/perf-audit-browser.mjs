import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = "http://127.0.0.1:3000";

async function login(page, url, email, password) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForLoadState("networkidle");
}

async function measureNav(page, label, href) {
  const backendHits = [];
  const nextDocs = [];
  const onRequest = (req) => {
    const u = req.url();
    if (u.includes(":3001/") || u.includes("/api/")) {
      backendHits.push({ url: u, method: req.method(), start: Date.now() });
    }
  };
  const onResponse = async (res) => {
    const u = res.url();
    const req = res.request();
    if (u.includes(":3001/")) {
      const hit = backendHits.find(
        (h) => h.url === u && h.end === undefined && h.method === req.method(),
      );
      if (hit) {
        hit.end = Date.now();
        hit.status = res.status();
        try {
          const buf = await res.body();
          hit.bytes = buf.length;
        } catch {
          hit.bytes = null;
        }
      }
    }
    if (
      req.resourceType() === "document" ||
      u.includes("/_next/data") ||
      u.includes("?_rsc") ||
      (u.includes(href) && res.request().resourceType() === "document")
    ) {
      nextDocs.push({
        url: u,
        status: res.status(),
        type: req.resourceType(),
      });
    }
  };

  page.on("request", onRequest);
  page.on("response", onResponse);

  const t0 = Date.now();
  const navPromise = page.evaluate(async (targetHref) => {
    performance.clearMarks();
    performance.clearMeasures();
    performance.mark("nav-start");
    const started = performance.now();
    const link = [...document.querySelectorAll("a")].find((a) => {
      try {
        const u = new URL(a.href);
        return u.pathname === targetHref;
      } catch {
        return false;
      }
    });
    if (!link) {
      location.assign(targetHref);
    } else {
      link.click();
    }
    await new Promise((resolve) => {
      const check = () => {
        if (location.pathname === targetHref || location.pathname.startsWith(targetHref + "/")) {
          resolve(null);
          return;
        }
        requestAnimationFrame(check);
      };
      check();
      setTimeout(resolve, 15000);
    });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    performance.mark("nav-paint");
    const interactive = performance.now() - started;
    return {
      pathname: location.pathname,
      interactiveMs: Math.round(interactive),
    };
  }, href);

  const client = await navPromise;
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => null);
  const wallMs = Date.now() - t0;

  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes(":3001/") || r.name.includes("_rsc") || r.name.includes("/admin") || r.name.includes("/dashboard") || r.name.includes("/employee"))
      .map((r) => ({
        name: r.name.replace(/^https?:\/\/[^/]+/, ""),
        duration: Math.round(r.duration),
        transferSize: r.transferSize,
        encodedBodySize: r.encodedBodySize,
        decodedBodySize: r.decodedBodySize,
        initiatorType: r.initiatorType,
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 25);
    return {
      navigationType: nav?.type ?? null,
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadEvent: nav ? Math.round(nav.loadEventEnd) : null,
      resources,
    };
  });

  page.off("request", onRequest);
  page.off("response", onResponse);

  const apiCalls = backendHits
    .filter((h) => h.end)
    .map((h) => ({
      url: h.url.replace(/^https?:\/\/[^/]+/, ""),
      method: h.method,
      ms: h.end - h.start,
      status: h.status,
      bytes: h.bytes,
    }));

  return {
    label,
    href,
    wallMs,
    clientInteractiveMs: client.interactiveMs,
    pathname: client.pathname,
    apiRequestCount: apiCalls.length,
    apiTotalMs: apiCalls.reduce((s, c) => s + c.ms, 0),
    apiMaxMs: apiCalls.length ? Math.max(...apiCalls.map((c) => c.ms)) : 0,
    apiBytes: apiCalls.reduce((s, c) => s + (c.bytes ?? 0), 0),
    apiCalls: apiCalls.sort((a, b) => b.ms - a.ms).slice(0, 15),
    timing,
    nextDocs: nextDocs.slice(0, 10),
  };
}

async function measureModalOpen(page, label, openSelectorText) {
  const backendHits = [];
  const onRequest = (req) => {
    if (req.url().includes(":3001/")) backendHits.push(req.url());
  };
  page.on("request", onRequest);
  const t0 = Date.now();
  const opened = await page.evaluate((text) => {
    const buttons = [...document.querySelectorAll("button")];
    const btn = buttons.find((b) =>
      (b.textContent || "").toLowerCase().includes(text.toLowerCase()),
    );
    if (!btn) return { ok: false, reason: "button not found" };
    const started = performance.now();
    btn.click();
    return { ok: true, clickMs: Math.round(performance.now() - started) };
  }, openSelectorText);
  await page.waitForTimeout(300);
  const dialogVisible = await page.locator('[role="dialog"], [aria-modal="true"]').first().isVisible().catch(() => false);
  page.off("request", onRequest);
  // close if open
  if (dialogVisible) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
  }
  return {
    label,
    wallMs: Date.now() - t0,
    opened,
    dialogVisible,
    backendRequestsDuringOpen: backendHits.length,
    backendUrls: backendHits,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = { admin: [], customer: [], employee: [], modals: [], notes: [] };

  // ADMIN
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(
      page,
      `${BASE}/admin/login`,
      "admin@jumpifzero.example",
      "DevAdminPass1!",
    );
    results.admin.push(
      await measureNav(page, "admin.dashboard (overview)", "/admin"),
    );
    results.admin.push(
      await measureNav(page, "admin.CMS services", "/admin/services"),
    );
    results.admin.push(
      await measureNav(page, "admin.CMS portfolio", "/admin/portfolio"),
    );
    results.admin.push(
      await measureNav(page, "admin.operations clients", "/admin/clients"),
    );
    results.admin.push(
      await measureNav(page, "admin.employees", "/admin/employees"),
    );
    results.admin.push(
      await measureNav(page, "admin.CRM sales", "/admin/sales"),
    );
    results.admin.push(
      await measureNav(page, "admin.CRM leads", "/admin/sales-leads"),
    );
    results.admin.push(
      await measureNav(page, "admin.security", "/admin/security"),
    );
    results.admin.push(
      await measureNav(page, "admin.return overview", "/admin"),
    );

    await page.goto(`${BASE}/admin/services`, { waitUntil: "networkidle" });
    results.modals.push(
      await measureModalOpen(page, "admin.services Add modal", "add"),
    );
    await page.goto(`${BASE}/admin/sales`, { waitUntil: "networkidle" });
    results.modals.push(
      await measureModalOpen(page, "admin.sales New/Add modal", "new"),
    );
    await context.close();
  }

  // CUSTOMER
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(
      page,
      `${BASE}/login`,
      "client@jumpifzero.example",
      "DevClientPass1!",
    );
    results.customer.push(
      await measureNav(page, "customer.overview", "/dashboard"),
    );
    results.customer.push(
      await measureNav(page, "customer.projects", "/dashboard/projects"),
    );
    results.customer.push(
      await measureNav(page, "customer.invoices", "/dashboard/invoices"),
    );
    results.customer.push(
      await measureNav(page, "customer.messages", "/dashboard/messages"),
    );
    results.customer.push(
      await measureNav(page, "customer.files", "/dashboard/files"),
    );
    results.customer.push(
      await measureNav(page, "customer.profile", "/dashboard/profile"),
    );
    results.customer.push(
      await measureNav(page, "customer.return overview", "/dashboard"),
    );
    await context.close();
  }

  // EMPLOYEE sales
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(
      page,
      `${BASE}/employee/login`,
      "sales@jumpifzero.example",
      "DevSalesPass1!",
    );
    results.employee.push(
      await measureNav(page, "employee.sales overview", "/employee"),
    );
    results.employee.push(
      await measureNav(page, "employee.CRM sales list", "/employee/sales"),
    );
    results.employee.push(
      await measureNav(page, "employee.CRM leads", "/employee/leads"),
    );
    results.employee.push(
      await measureNav(page, "employee.return overview", "/employee"),
    );
    await context.close();
  }

  // EMPLOYEE delivery
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(
      page,
      `${BASE}/employee/login`,
      "delivery@jumpifzero.example",
      "DevDeliveryPass1!",
    );
    results.employee.push(
      await measureNav(page, "employee.delivery overview", "/employee"),
    );
    results.employee.push(
      await measureNav(page, "employee.delivery projects", "/employee/projects"),
    );
    results.employee.push(
      await measureNav(page, "employee.delivery clients", "/employee/clients"),
    );
    await context.close();
  }

  const out = path.join(root, "backend", "scripts", "perf-audit-browser-results.json");
  writeFileSync(out, JSON.stringify(results, null, 2));
  console.log(JSON.stringify({
    admin: results.admin.map((r) => ({
      label: r.label,
      wallMs: r.wallMs,
      interactiveMs: r.clientInteractiveMs,
      apiCount: r.apiRequestCount,
      apiTotalMs: r.apiTotalMs,
      apiBytes: r.apiBytes,
    })),
    customer: results.customer.map((r) => ({
      label: r.label,
      wallMs: r.wallMs,
      interactiveMs: r.clientInteractiveMs,
      apiCount: r.apiRequestCount,
      apiTotalMs: r.apiTotalMs,
      apiBytes: r.apiBytes,
    })),
    employee: results.employee.map((r) => ({
      label: r.label,
      wallMs: r.wallMs,
      interactiveMs: r.clientInteractiveMs,
      apiCount: r.apiRequestCount,
      apiTotalMs: r.apiTotalMs,
      apiBytes: r.apiBytes,
    })),
    modals: results.modals,
  }, null, 2));
  console.log("wrote", out);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
