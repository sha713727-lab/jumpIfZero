# Locked decisions — backend + database (v1)

## §31 Decisions 1–13

1. **HTTP:** Native `node:http` only. Approved libraries: `busboy`, `argon2` (argon2id), `pg`, `zod`, PostgreSQL `uuidv7()`. No Express/Nest/Fastify/Koa/Hono.
2. **Shared schemas:** `packages/contracts` npm workspace. Frontend removes direct `zod`; depends on `@jumpifzero/contracts`. Next 16: root workspaces + `transpilePackages: ["@jumpifzero/contracts"]` if shipping TS source.
3. **Query layer:** Raw SQL with `pg`. No ORM.
4. **Primary keys:** `uuidv7()`.
5. **Money:** `numeric(14,2)` system-wide.
6. **Currencies:** Per-row `char(3)` ISO. Store PKR and USD. No FX conversion in v1.
7. **Sessions:** `sessions` table. Cookie carries signed session ID (+ claims). Option **(ii)** with Next→backend lookup. Next has **no** Postgres pool.
8. **Tax ID:** Application-level AEAD on `tax_id`. Full-value reads audited. Masked by default on list/detail unless authorized. (Mandatory — decision 12 = real.)
9. **File storage:** Local disk, single volume, v1. Backing store is one swappable module; upload handling, ownership checks, and signed-URL logic must not change when moving to S3-compatible later.
10. **Deploy:** Long-running container, single instance, v1. No PgBouncer. Pool: `max=10`, `idleTimeoutMillis=30000`, `connectionTimeoutMillis=5000` (one process; ~10% of default `max_connections=100`; headroom for `jz_owner`/admin).
11. **Deletes:** Soft delete (`archived_at`) for clients, employees, services, blog_posts, projects, invoices, messages, files, sales, leads (and content peers as migrated). Hard delete/TTL for nonces, idempotency keys, expired sessions. Files: partial unique `(client_id, name)` among active.
12. **Freight/sales PII:** **Real** US carrier DOT, MC, and EIN in production. Synthetic seed values (IRS example EINs, 555 phones, `.example` domains) are **dev seeds only** under `database/seeds/dev/` — never carried into production tables.
13. **HMAC posture:** Backend network-isolated. HMAC mandatory as defence in depth.

## Follow-ons A–E

**A.** Zod exact-pinned only in `packages/contracts`. Apps must not declare `zod`. CI fails on direct dep outside contracts and on `npm ls zod` multi-version.

**B.** All money arithmetic in SQL (`numeric`). No decimal library. Stop and ask if a case cannot be expressed in SQL.

**C.** Session option (ii) + Next→backend. In-process Next cache of session validity by session ID, **TTL 60s**. Evict on explicit logout in the same process. Backend unreachable: cached-valid rides out short outage; uncached/cached-invalid fail closed. **Revocation delay: up to 60s**, per Node instance (single instance today; multiple instances each have their own cache — instant cross-instance revocation is a new decision). Nobody can log out if backend is down (logout needs the round trip). Security note: not instant revocation.

**D.** Blind HMAC indexes on `us_dot` and `mc`, partial-unique among active rows; “is this DOT already on file?” in scope. `tax_id`: AEAD only — no blind index, no search-by-EIN. Keys separated and rotated independently:

| Secret | Purpose |
| --- | --- |
| `SESSION_SECRET` | Next cookie seal/verify |
| `HMAC_SECRET` (+ previous) | Next ↔ backend |
| `TAX_ID_AEAD_KEY` (+ previous) | AEAD for `tax_id` |
| `BLIND_INDEX_HMAC_KEY` (+ previous) | Deterministic HMAC for `us_dot` / `mc` |

**E.** Active reads via per-table views (`WHERE archived_at IS NULL`). Harden: **revoke direct `SELECT` on soft-delete base tables from `jz_app`** — missing filter is a privilege error. Partial uniques among active: `clients.email`, `employees.email`, `services.slug`, `blog_posts.slug`, `invoices.number`, `sales.us_dot` / `sales.mc` (via blind indexes), `files (client_id, name)`.
