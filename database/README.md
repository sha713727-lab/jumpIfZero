# Database

PostgreSQL **18.x**. Roles, migrations, and seeds for JumpIfZero.

## Layout

```text
database/
  DECISIONS.md          locked §31 + follow-ons
  ERD.md                approved data model (v4)
  roles/001_roles.sql   jz_owner / jz_app / jz_readonly
  migrations/           NNNN_name.up.sql + .down.sql
  seeds/dev/            development fixtures only — never production
  schema.sql            regenerated snapshot (pg_dump --schema-only)
  README.md
```

## Roles (verified after 0001 v4)

`001_roles.sql` creates `jz_owner` / `jz_app` / `jz_readonly` (scram-sha-256, no public CREATE, `search_path=public`). Object grants live in migrations:

- `jz_app`: **no SELECT** on soft-delete base tables; **SELECT** on `*_active` views; INSERT/UPDATE/DELETE on bases; full DML on non-soft-delete infra tables.
- `jz_readonly`: SELECT on bases and views.
- `jz_owner`: owns objects; migrations only.

## Prerequisites

- PostgreSQL 18 (`psql` on PATH)
- Superuser for roles bootstrap
- Env: `JZ_OWNER_PASSWORD`, `JZ_APP_PASSWORD`, `JZ_READONLY_PASSWORD`

## Create database + roles

```bash
createdb jumpifzero
psql -d jumpifzero -f database/roles/001_roles.sql
psql -c "ALTER ROLE jz_owner PASSWORD '${JZ_OWNER_PASSWORD}'"
psql -c "ALTER ROLE jz_app PASSWORD '${JZ_APP_PASSWORD}'"
psql -c "ALTER ROLE jz_readonly PASSWORD '${JZ_READONLY_PASSWORD}'"
```

Ensure `password_encryption = scram-sha-256`.

## Migrate

Apply as `jz_owner`, in order. Record version + checksum in `schema_migrations`.

```bash
psql -U jz_owner -d jumpifzero -f database/migrations/0001_init.up.sql
# then insert schema_migrations row (see scripts when backend lands)
```

After each migration: regenerate `schema.sql` and commit it.

## Seeds

`seeds/dev/` only. Synthetic IRS-example EINs, 555 phones, `.example` domains must never load into production.
