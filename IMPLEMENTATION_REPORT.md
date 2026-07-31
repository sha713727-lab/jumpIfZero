# IMPLEMENTATION REPORT (in progress)

**Phase context (updated):** This phase still closes frontend production gaps.
A **real backend + database starts after this phase**. Treat seed/`lib/data`/`schemas`
as the migration seam, not as permanent product architecture.

## Phase batch order (adjusted)

| Order | Batch | Notes |
|---|---|---|
| done | 1, Google fakes #49–51, #52, **3.5** (+ 8a–8d acceptance) | Cookie sessions + role/kind gates + swappable `lookupCredentials` |
| done | **2**, **3**, **4**, **4.5**, **4.6** | Public-site + empty states + data seam + zod schemas |
| next | **5** | |
| then | 5 → 6 | Unchanged |
| then | **7** Bundle | **Analysis only** this phase |
| then | 8+ / cleanup | Unchanged |

## E. Residual risk register

Status legend: **CLOSED** | **SCHEDULED** (lands with backend — not accepted forever) | **ACCEPTED** (won't fix in known plan) | **OPEN** | **Downgraded**

| Risk | Status | Detail |
|---|---|---|
| Client-only `sessionStorage` sessions | **CLOSED (Batch 3.5)** | Signed `__Host-jz_session` httpOnly cookies. |
| Role confinement | **CLOSED (8a)** | `requireSession(role)` → `verifySession(role)` → `readSessionValue` rejects `payload.role !== role`. Proven with cross-role GETs + SA. |
| Employee kind gating (finding 10) | **CLOSED (8b)** | Server: `requireEmployeeKind` in nested layouts under `sales`/`leads` (sales-only) and `clients`/`projects`/`files` (delivery-only). Client shell UX redirect retained; server is source of truth. |
| Seed data in client chunks | **SCHEDULED (backend)** | Leaves client bundle when portals read via server `lib/data` + DB. |
| Login rate limiting | **SCHEDULED (backend)** | Needs DB-backed bucket (§11). |
| Session revocation / durable sessions | **SCHEDULED (backend)** | Current: signed cookie, **8h** exp, no revoke list. |
| Server-side authz beyond role cookie | **SCHEDULED (backend)** | Fine-grained resource authz with real data access. |
| Finding 14 CSP `unsafe-inline` scripts | **Downgraded to P2** | Batch 6 as specified. |
| Fake Google / register | **CLOSED (#49–52)** | |
| No backend / CMS / i18n / tests | **SCHEDULED (post-phase)** | Backend+DB after this phase. |
| `npm audit` high via next→postcss/sharp | **ACCEPTED (this phase)** | Do not `audit fix --force`. |
| Seed as product data in `constants/` | **SCHEDULED (backend)** | Seam: `lib/data` async getters; constants only consumed there. |

## F. Decisions needed / answered

| Item | Answer |
|---|---|
| 6.1 CSP | Leave script-src; no proxy; apply object-src/HSTS/etc. as specified |
| 6.2 Contact | (b) mailto + tel |
| 6.3 Contact details | email `ikram@jumpifzero.com`, phone `03079222055`, delete “50 states”, keep Lahore |
| 3.5 cookies | Implemented with amendments 1–4; **accepted pending 8a–8d (now done)** |
| 4.6 validation lib | **APPROVED — zod v4** (prove zero client chunk hits) |
| **Demo portal accessibility** | **FLAG — needs your decision.** With `demoHint` removed and all portal passwords only in server env (`DEMO_*`), admin/employee/customer portals are **not enterable by anyone without server/env access**. If these portals are meant to be demonstrable to prospects, say how you want that handled (separate demo creds doc, staged invite, etc.). Not recorded as a residual risk — product decision. |

## New findings filed

| ID | Severity | Location | Issue | Status |
|---|---|---|---|---|
| **49** | P0 | customer Google fake | Fake Google grants customer session | **fixed** |
| **50** | P0 | employee Google fake | Fake Google grants employee session | **fixed** |
| **51** | P0 | register Google fake | Fake Google on register | **fixed** |
| **52** | P0 | `/register` + `submitRegister` | Password collected; no user store | **fixed by deletion** |

## Batch notes

### Batch 3.5 acceptance — 8a / 8b / 8c / 8d

**8a — Role confinement (PASS)**  
`requireSession(role)` compares `payload.role` (via `readSessionValue`). Evidence (`:3011`):

```
customer -> /admin: 307 .../admin/login
customer -> /employee: 307 .../employee/login
employee -> /admin: 307 .../admin/login
admin -> /dashboard: 307 .../login
customer -> /dashboard (control): 200
customer cookie + submitSignOut("admin"): 303 x-action-redirect: /admin/login;push
```

Expected for admin→/dashboard: **reject** (not impersonate customer). Confirmed redirect to `/login`.

**8b — Employee kind (PASS, server-enforced)**  
`src/lib/auth/requireEmployeeAccess.ts` + nested layouts. Evidence (RSC body contains redirect when nested layout runs; HTTP may still be 200 with flight digest):

```
delivery->sales -> NEXT_REDIRECT;replace;/employee
delivery->leads -> NEXT_REDIRECT;replace;/employee
sales->sales -> NO_REDIRECT (rendered)
sales->clients -> NEXT_REDIRECT;replace;/employee
sales->leads -> NO_REDIRECT (rendered)
delivery->clients -> NO_REDIRECT (rendered)
```

**8c — `__Host-` / Secure (PASS)** — unconditional `secure: true`:

```ts
function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
```

**8d — `.env.example` SESSION_SECRET (PASS)** — obvious placeholder, length ≥32:

```
SESSION_SECRET=REPLACE_ME__not_a_real_secret__min_32_chars
```

### #52 — register removal
- Batch 3 lint `submitRegister.ts:8 unused _values`: **resolved by deletion**.
- `credentialsError` still used on failed customer login — kept.

### Batch 3.5 — cookie sessions
- Swappable credential lookup: `src/lib/auth/lookupCredentials.ts`
- Cookie: `__Host-jz_session`, httpOnly, Secure, SameSite=Lax, Path=/, maxAge=**8h**

### BATCH 2 — Public-site correctness (done this session)
| ID | Change |
|---|---|
| **46** | Deleted `scrollStory.sources` (`bitnextechnologies.com` / `jumpifzero.com`). `rg sources frontend/src` → empty. |
| **45** | Removed “50 states” claim; `locationLede` is address-derived only. Lahore block kept. |
| **43** | Real email/phone on about + contact: `ikram@jumpifzero.com`, `03079222055` (`tel:+923079222055`). |
| **44** | Option (b): removed mock form/`submitContact`/`validateContact`; contact page is mailto + tel (`ContactDirect`). |

- Unchanged from prior plan; zod **approved** for Batch 4.6.

### BATCH 4.6 — Schemas (zod v4)

**Installed:** `zod@^4.4.3`

**Delivered**
- `src/schemas/{admin,login,customer,env,index}.ts` — entity + login + env schemas; types via `z.infer` / `z.input`
- `constants/adminDemo.ts` / login auth types / `demoCustomer` consume schema types (no hand-written entity interfaces)
- Runtime validation on server: `submitLogin` / `submitAdminLogin` / `submitEmployeeLogin` + `lib/env.ts`
- **Replaced** (deleted): `validateLogin.ts`, `validateAdminLogin.ts`, `validateEmployeeLogin.ts`
- Client login forms use server-returned `fieldErrors` (zod never imported in client components)

**Server-only proof** (after `npm run build`):

```
rg -l "zod" frontend/.next/static/chunks
→ 0 hits (exit 1)
```

### BATCH 4.5 — Data-access seam

**Delivered**
- `src/lib/data/{admin,customer,dashboard,blog,team,services,portfolio,index}.ts`
- Async getters: `getClients`, `getProjects`, `getInvoices`, `getMessages`, `getFiles`, `getSales`, `getLeads`, `getEmployees`, `getAdminDemoState`, `getDemoCustomer`, dashboard demo getters, blog/team/services/portfolio getters
- Components/app/auth import seed from `@/lib/data/*` only; `constants/*` seed consumed by `lib/data` (plus `constants/serviceDetails` → `servicesStory` internal)
- Transitional sync re-exports kept so clients stay green without conversion this batch
- `app/(public)/blog/[slug]/page.tsx` already `await getBlogPost` (server; no Suspense)

**Files changed (import rewire):** **45** under `components/` + `app/` (plus `lib/auth/lookupCredentials.ts`, `lib/auth/requireEmployeeAccess.ts`, `constants/employee.ts` type path)

**Async → client→server / Suspense — listed only, not converted**

| Site | Why |
|---|---|
| `AdminDemoProvider.tsx` | Client; `useState(initialAdminDemoState)` — needs server-fetched initial props or Suspense |
| `EmployeeDemoProvider.tsx` | Same |
| `EmployeeShell.tsx` | Client; reads `initialAdminDemoState` |
| `BlogPageClient.tsx` | Client; maps `blogPosts` |
| `BlogDetailClient.tsx` | Client; filters `blogPosts` for related |
| `PortfolioPageClient.tsx` | Client; `portfolioProjects` / marquee |
| `AltTeam.tsx` | Client; `teamMembers` |
| `AltServices.tsx` | Client; `serviceChapters` |
| `AboutBelowFold.tsx` | Client; `teamMembers` |
| `DashboardShell.tsx` | Client; `demoCustomer` |
| `ProfilePage.tsx` | Client; `demoCustomer` |
| `FilesPage.tsx` (dashboard) | Client; `demoFiles` |
| `MessagesPage.tsx` (dashboard) | Client; `demoMessages` |
| `InvoicesPage.tsx` (dashboard) | Client; `demoInvoices` |

**Not conversion sites (can await in place later):** async `lookupCredentials` / `requireEmployeeAccess`; server `OverviewPage` / `ProjectsPage` / `dashboard/layout`; `generateStaticParams` → `async` + `await getBlogPosts()`. Type-only admin/employee CRUD imports get data from demo providers.
