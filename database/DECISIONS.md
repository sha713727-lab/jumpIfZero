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

**C (sessions).** Option (ii) + Next→backend + 60s cache. **No `sessions.role` or `sessions.employee_kind`.** Validity check joins `users` (and `employees` for kind). HMAC asserted role/kind come from that live lookup, never the cookie. Revocation delay ≤60s per instance.

**D (carriers identifiers, revised C1).** `carriers.us_dot` / `carriers.mc` are **plaintext** with ordinary partial unique indexes among active rows. No blind indexes. `tax_id`: AEAD only — no index, audited on full read. Keys: `SESSION_SECRET`, `HMAC_SECRET` (+ previous), `TAX_ID_AEAD_KEY` (+ previous). `BLIND_INDEX_HMAC_KEY` removed.

**E.** Active views + revoke `jz_app` SELECT on soft-delete bases. Partial uniques: `users.email`, `services.slug`, `blog_posts.slug`, `invoices.number`, `carriers.us_dot`, `carriers.mc`, `files (client_id, original_name)`.
