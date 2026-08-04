-- database/roles/001_roles.sql
-- Apply as a PostgreSQL superuser while connected to the target application database.
-- Passwords are NOT set here. After create, set from env (never commit secrets):
--   psql -c "ALTER ROLE jz_owner PASSWORD '${JZ_OWNER_PASSWORD}'"
--   psql -c "ALTER ROLE jz_app PASSWORD '${JZ_APP_PASSWORD}'"
--   psql -c "ALTER ROLE jz_readonly PASSWORD '${JZ_READONLY_PASSWORD}'"
-- Cluster auth: password_encryption = scram-sha-256.

BEGIN;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;

DO $$
DECLARE
  db_name text := current_database();
BEGIN
  EXECUTE format('REVOKE ALL ON DATABASE %I FROM PUBLIC', db_name);

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'jz_owner') THEN
    CREATE ROLE jz_owner WITH
      LOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION
      NOBYPASSRLS;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'jz_app') THEN
    CREATE ROLE jz_app WITH
      LOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION
      NOBYPASSRLS;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'jz_readonly') THEN
    CREATE ROLE jz_readonly WITH
      LOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION
      NOBYPASSRLS;
  END IF;

  EXECUTE format('GRANT CONNECT ON DATABASE %I TO jz_owner', db_name);
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO jz_app', db_name);
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO jz_readonly', db_name);
END
$$;

ALTER ROLE jz_owner SET search_path = public;
ALTER ROLE jz_app SET search_path = public;
ALTER ROLE jz_readonly SET search_path = public;

GRANT USAGE, CREATE ON SCHEMA public TO jz_owner;
GRANT USAGE ON SCHEMA public TO jz_app;
GRANT USAGE ON SCHEMA public TO jz_readonly;

ALTER SCHEMA public OWNER TO jz_owner;

COMMIT;
