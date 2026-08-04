# ERD & data model — design gate (v4)

**Status: APPROVED for squash** (v3 + L–P). Rewrite `0001` to this model.

v3 content below remains authoritative except where this delta overrides.

---

## v4 delta (L–P)

| ID | Fix |
|---|---|
| **L** | **`clients.initials` removed** — derived from `users.name` only; never a column. |
| **M** | **Archive rules** — see §Archive below. Users **(b)**; carriers **(a)** cascade-archive sales; parties **(a)** clear FKs on sales. Enforced in **repository layer**. |
| **N** | `messages.sender_user_id` / `files.uploaded_by_user_id` stay **RESTRICT**. Deliberate: **users who have acted are effectively permanent for hard-delete** (soft-archive still allowed under §Archive). Stated in §7. |
| **O** | Rename `clients.role_title` → **`client_contact_title`**. Why: `users.title` is the person’s org/job title (e.g. Founder & Admin, Sales Lead); `client_contact_title` is their title *at the client company* (e.g. Marketing Director). Different domains — keep both under distinct names. |
| **P** | **Drop `blog_posts.author`.** Seed is always organizational (“JZ Enterprises”). Render brand at the edge. |

### §Archive rules (soft-deleted parents)

| Parent | Rule | Dependents | Where enforced |
|---|---|---|---|
| **users** | **(b)** Refuse archive with **409** if an **active** (`archived_at IS NULL`) `clients` or `employees` row references `user_id`. Archive the profile first, explicitly. | client / employee profiles | `users` archive repository method |
| **carriers** | **(a)** Archive carrier **and** all its **active** `sales` in the **same transaction**. | sales | `carriers` archive repository method |
| **parties** | **(a)** Archive party; in the same transaction **SET NULL** `sales.insurance_party_id` / `factoring_party_id` where equal to this party (sales stay; vendor link cleared — matches SET NULL hard-delete semantics). | sales FK columns | `parties` archive repository method |
| Other soft-delete tables | Archive self only unless a rule above applies. RESTRICT FKs still block **hard** DELETE. | — | per-entity repositories |

Hard DELETE of `users` referenced by `messages.sender_user_id` or `files.uploaded_by_user_id` remains blocked by RESTRICT (**N**). Prefer soft-archive for people.

### CLIENTS entity (corrected)

No `initials`. Columns: `id`, `user_id`, `company`, `phone`, `status_code`, `member_since`, **`client_contact_title`**, `location`, `plan`, `version`, `archived_at`, `created_at`, `updated_at`.

### BLOG_POSTS entity (corrected)

No `author`. Display author = brand string at presentation edge.

---

# ERD v3 body (still applies except L–P overrides)

**Authority:** This document + [`DECISIONS.md`](./DECISIONS.md).

---

## 0. Ordering

- Premature `0001_init` is **dev-only**, **0 business rows**.
- **SQUASH:** rewrite `0001` to match v4 — no corrective `0002`.

---

## 1. Resolved decisions (cumulative through v4)

| ID | Resolution |
|---|---|
| **5.1** | `users` auth-only; profile FKs; `sessions.subject_id` = `users.id`; `password_hash` only on `users`. |
| **C** | `users.name` NOT NULL; no name on profiles; admins = `role='admin'` no profile; `users.title` nullable; initials derived. |
| **5.2–5.8, A1–A5, A–K** | as v3 |
| **L–P** | as delta above |

### Key inventory

| Secret | Purpose |
|---|---|
| `SESSION_SECRET` | Next cookie seal/verify |
| `HMAC_SECRET` (+ previous) | Next ↔ backend |
| `TAX_ID_AEAD_KEY` (+ previous) | AEAD for `carriers.tax_id` |

---

## 2. Subsystem overview

| Subsystem | Entities |
|---|---|
| Identity | `users`, `clients`, `employees`, `sessions` |
| Lookups | `client_statuses`, `project_statuses`, `invoice_statuses`, `sale_statuses`, `lead_statuses`, `callback_statuses`, `contact_message_statuses` |
| Delivery | `client_employee_assignments`, `projects`, `invoices`, `messages`, `files` |
| Sales | `carriers`, `parties`, `sales`, `leads`, `lead_follow_ups`, `sales_messages`, `tax_id_access_audit` |
| Content | `services`, `portfolio_items`, `blog_posts`, `faqs`, `team_members`, `team_member_socials` |
| Inbound | `callbacks`, `contact_messages` |
| Infra | `schema_migrations`, `hmac_nonces`, `rate_limit_buckets`, `idempotency_keys` |

---

## 3. Diagrams (v4 — identity snippet)

```mermaid
erDiagram
    USERS {
        uuid id PK
        text email UK "partial active"
        text password_hash
        text name "NOT NULL"
        text title "nullable"
        text role "admin|client|employee"
        integer version
        timestamptz archived_at
        timestamptz created_at
        timestamptz updated_at
    }
    SESSIONS {
        uuid id PK
        uuid subject_id FK
        text token_hash UK
        timestamptz expires_at
        timestamptz revoked_at
        timestamptz created_at
        timestamptz updated_at
    }
    CLIENTS {
        uuid id PK
        uuid user_id FK_UK
        text company
        text phone
        text status_code FK
        date member_since
        text client_contact_title
        text location
        text plan
        integer version
        timestamptz archived_at
        timestamptz created_at
        timestamptz updated_at
    }
    EMPLOYEES {
        uuid id PK
        uuid user_id FK_UK
        text title
        text department
        text kind
        text image_path
        integer version
        timestamptz archived_at
        timestamptz created_at
        timestamptz updated_at
    }
    USERS ||--o{ SESSIONS : "subject_id"
    USERS ||--o| CLIENTS : "user_id"
    USERS ||--o| EMPLOYEES : "user_id"
    CLIENT_STATUSES ||--o{ CLIENTS : "RESTRICT"
```

Remaining diagrams: as v3 with overrides — no `employees.team_member_id`; no `carriers.type`; no `blog_posts.author`; `sales.approved_by_user_id`; all seven status lookups; `parties` soft-delete; idempotency `UNIQUE NULLS NOT DISTINCT`; rate_limit `last_refill_at` index.

---

## 5. Relationships

As v3, plus archive rules in §Archive. Status FKs all `ON DELETE RESTRICT`.

---

## 6. Lookups

Seven tables: client, project, invoice, sale, lead, callback, contact_message statuses — `code`, `label`, `sort_order`, `color`.

---

## 7. Sensitive data + retention + permanence

| Note | |
|---|---|
| tax_id AEAD; DOT/MC plaintext unique | C1 |
| **N** | Users who sent messages or uploaded files **cannot be hard-deleted** (RESTRICT). Soft-archive under §Archive (b) only after profiles archived. Treat acting users as **effectively permanent** for physical delete. |
| Retention | Provisional (jurisdiction open): carriers/sales/audit/parties 7y; clients/invoices/messages/files 7y; leads 3y; callbacks/contact/sales_messages 2y; infra TTL |

---

## 8. Indexes (key)

Partial UK: users.email, services.slug, blog_posts.slug, invoices.number, carriers.us_dot, carriers.mc, files(client_id, original_name).  
Idempotency: `UNIQUE NULLS NOT DISTINCT (idempotency_key, method, path, subject_id)`.  
Cleanup: `rate_limit_buckets(last_refill_at)`, `hmac_nonces(expires_at)`, `sessions(expires_at)`.

---

## Stop / build

Squash `0001` to this v4 model; verify down; regenerate `schema.sql`; confirm `jz_app` grants.
