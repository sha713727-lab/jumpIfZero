# Database

PostgreSQL **18.x**. Roles, migrations, and seeds for JumpIfZero.

## Layout

```text
database/
  DECISIONS.md          locked §31 + A–E
  roles/001_roles.sql   jz_owner / jz_app / jz_readonly
  migrations/           NNNN_name.up.sql + .down.sql
  seeds/dev/            development fixtures only — never production
  schema.sql            regenerated snapshot (pg_dump --schema-only)
  README.md
```

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
