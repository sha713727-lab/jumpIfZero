# Locked decisions — backend + database (v1)

## §31 Decisions 1–13

1. **HTTP:** Native `node:http` only. Approved libraries: `busboy`, `argon2` (argon2id), `pg`, `zod`, PostgreSQL `uuidv7()`. No Express/Nest/Fastify/Koa/Hono.
2. **Shared schemas:** `packages/contracts` npm workspace. Frontend removes direct `zod`; depends on `@jumpifzero/contracts`. Next 16: root workspaces + `transpilePackages: ["@jumpifzero/contracts"]` if shipping TS source.
3. **Query layer:** Raw SQL with `pg`. No ORM.
4. **Primary keys:** `uuidv7()`.
5. **Money:** `numeric(14,2)` system-wide.
6. **Currencies:** Per-row `char(3)` ISO. Store PKR and USD. No FX conversion in v1.
7. **Sessions:** `sessions` table. Cookie carries signed **session id only** (not role/kind). Option **(ii)** with Next→backend lookup; live join to `users`/`employees` for role and kind. Next has **no** Postgres pool.
8. **Tax ID:** Application-level AEAD on `tax_id`. Full-value reads audited. Masked by default on list/detail unless authorized. (Mandatory — decision 12 = real.)
9. **File storage:** Local disk, single volume, v1. Backing store is one swappable module; upload handling, ownership checks, and signed-URL logic must not change when moving to S3-compatible later.
10. **Deploy:** Long-running container, single instance, v1. No PgBouncer. Pool: `max=10`, `idleTimeoutMillis=30000`, `connectionTimeoutMillis=5000` (one process; ~10% of default `max_connections=100`; headroom for `jz_owner`/admin).
11. **Deletes:** Soft delete (`archived_at`) for users, clients, employees, services, blog_posts, projects, invoices, messages, files, sales, leads, parties, carriers (and content peers). **Archive rules (repository):** users **(b)** — refuse archive (409) while active client/employee profile exists; carriers **(a)** — archive carrier + active sales in one txn; parties **(a)** — archive party + SET NULL sales vendor FKs in one txn. Hard DELETE of users blocked by RESTRICT from messages/files (acting users effectively permanent). Hard delete/TTL for nonces, idempotency keys, expired sessions, stale rate-limit buckets. Files: partial unique `(client_id, original_name)` among active.

12. **Freight/sales PII:** **Real** US carrier DOT, MC, and EIN in production. Synthetic seed values (IRS example EINs, 555 phones, `.example` domains) are **dev seeds only** under `database/seeds/dev/` — never carried into production tables.
13. **HMAC posture:** Backend network-isolated. HMAC mandatory as defence in depth.

## Follow-ons A–E

**A.** Zod exact-pinned only in `packages/contracts`. Apps must not declare `zod`. CI fails on direct dep outside contracts and on `npm ls zod` multi-version.

**B.** All money arithmetic in SQL (`numeric`). No decimal library. Stop and ask if a case cannot be expressed in SQL.

**C (sessions).** Option (ii) + Next→backend + 60s cache. **No `sessions.role` or `sessions.employee_kind`.** Validity check joins `users` (and `employees` for kind). HMAC asserted role/kind come from that live lookup, never the cookie. Revocation delay ≤60s per instance. Next sets **separate `__Host-` cookies per portal role** (`admin` / `customer` / `employee`) so concurrent portal logins in one browser do not overwrite each other; signing out one role only clears that role’s cookie.

**D (carriers identifiers, revised C1).** `carriers.us_dot` / `carriers.mc` are **plaintext** with ordinary partial unique indexes among active rows. No blind indexes. `tax_id`: AEAD only — no index, audited on full read. Keys: `SESSION_SECRET`, `HMAC_SECRET` (+ previous), `TAX_ID_AEAD_KEY` (+ previous). `BLIND_INDEX_HMAC_KEY` removed.

**E.** Active views for application list/detail reads. Partial uniques: `users.email`, `services.slug`, `blog_posts.slug`, `portfolio_items.slug`, `invoices.number`, `carriers.us_dot`, `carriers.mc`, `files (client_id, original_name)`. **`jz_app` SELECT on soft-delete bases is granted** — PostgreSQL requires `SELECT` to evaluate `UPDATE`/`DELETE` `WHERE` and `SET` expressions; without it writes fail (`42501`). Repositories still **read only via `*_active` views**. Missing `archived_at` filters are caught by code review/tests, not privilege errors.

**F (auth Phase 1).** Cookie owned by Next (`SESSION_SECRET`); backend returns opaque `sessionToken` + cookie metadata only. Pre-auth routes (`/auth/login`, `/auth/logout`, `/auth/session/validate`, `/auth/password/forgot`, `/auth/password/reset`) use HMAC role `gateway` with `HMAC_GATEWAY_SUBJECT_ID`. Authenticated routes load `users.role` + `employees.kind` from DB and reject HMAC assertion mismatch. Session TTL 8h absolute; sliding extend when remaining < 50%; token rotate on login only; password change/reset revokes all sessions. `password_reset_tokens` via migration `0003`. RBAC = role + employee kind only — no permissions/ACL tables.

**G (identity Phase 2).** Users/employees CRUD admin-only (self profile read/update excepted). Archive=`archived_at` deactivate; restore=activate. No employee unassign; `user_id` NOT NULL UNIQUE; rehire via restore. Email normalized lowercase on write. Forbid self-archive, self admin demotion, last-admin archive (409). Seed client users without `clients` rows until Clients phase. Frontend auth uses opaque session cookie + backend login/validate/logout only.

**H (operations Phase 3).** Clients/projects/invoices/messages/files. Assignments = replace-set `PUT` (hard DELETE, no history). Messages client-scoped (no recipients). Files client-scoped (no project_id). Project status forward-only. Delivery employees only for these modules. Client create binds existing `role=client` user. Invoice create requires `Idempotency-Key`. Messages/files archive by id (no version). Upload MIME: jpeg/png/webp/pdf via busboy + magic bytes. Local storage behind `FILE_STORAGE_ROOT` module.

**I (CRM Phase 4).** RBAC: admin full CRM; sales employees own sales/leads by `rep_id`; carriers/parties shared R/W among CRM roles; delivery and client roles 403. Sale sheet create/update = one transaction upserting carrier + insurance/factoring parties + sale; flat public shape; never persist UI `type`. `amount > 0` and `currency` required (no 0/USD defaults). Any valid `sale_statuses`/`lead_statuses` FK code allowed. `lead_follow_ups` and `sales_messages` hard DELETE only. Tax ID masked on list/detail; plaintext only via `GET /carriers/:id/tax-id` with audit. Carrier archive cascades active sales; party archive SET NULLs sales vendor FKs. Sales messages between sales-kind employees only; sales see own threads; admin sees all.

**J (CMS Phase 5).** Public website + CMS. Migration `0004`: `portfolio_items.slug` required + partial unique among active; `faqs.sort_order` / `team_members.sort_order` INTEGER NOT NULL DEFAULT 0 with reorder APIs. CMS images reuse `FILE_STORAGE_ROOT` + MIME/magic validation under `cms/` storage keys persisted in `image_path` — no `files` rows, no Base64, no assets table. Public reads via gateway HMAC (published only); admin writes require Phase 2 RBAC. Contact/callbacks: public submit + admin inbox; no email/notifications. Service detail quote/highlights/CTA remain static presentation keyed by service slug. Restore for all soft-deleted CMS entities. Sitemap from live DB. Migration `0008`: singleton `site_contact` row (`singleton_key='default'`) for public Contact/About/invoice company details; admin PATCH + gateway GET. Migration `0009`: invoices store Bill to / From snapshot columns used by print/PDF (create/update carry overrides; `client_id` FK retained). Migration `0010`: `invoices.client_id` nullable so admin/delivery can bill outsiders with Bill to only (no portal access); registered-client invoices still link via FK.

**K (Portal Phase 6).** Customer dashboard + employee delivery cutover. Customer self profile: `PATCH /users/me` (name/title) + `GET|PATCH /clients/me` for own client only (`company`, `phone`, `location`, `clientContactTitle`); never trust client id from frontend; status/plan/memberSince admin-only. Overview KPIs derived from live lists only. Delivery employee uses backend-scoped ops APIs; sales continues Phase 4 CRM. No Base64 uploads.

**L (Hardening Phase 7).** Automated `node:test` suites (unit/integration/API journeys); env placeholder rejection for frontend secrets and uniform AEAD keys; ops cleanup script for expired sessions/nonces/idempotency/rate-limit rows; backend CI. No schema redesign. No Docker added (absent by design for v1).
