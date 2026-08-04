-- 0001_init.down.sql
-- Reverse of 0001_init.up.sql. Apply as jz_owner.

BEGIN;

DROP VIEW IF EXISTS contact_messages_active;
DROP VIEW IF EXISTS callbacks_active;
DROP VIEW IF EXISTS files_active;
DROP VIEW IF EXISTS messages_active;
DROP VIEW IF EXISTS invoices_active;
DROP VIEW IF EXISTS projects_active;
DROP VIEW IF EXISTS team_members_active;
DROP VIEW IF EXISTS faqs_active;
DROP VIEW IF EXISTS blog_posts_active;
DROP VIEW IF EXISTS portfolio_items_active;
DROP VIEW IF EXISTS services_active;
DROP VIEW IF EXISTS clients_active;
DROP VIEW IF EXISTS employees_active;
DROP VIEW IF EXISTS admins_active;

ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_team_member_id_fkey;

DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS callbacks;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS portfolio_items;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS client_employee_assignments;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS invoice_statuses;
DROP TABLE IF EXISTS project_statuses;
DROP TABLE IF EXISTS idempotency_keys;
DROP TABLE IF EXISTS rate_limit_buckets;
DROP TABLE IF EXISTS hmac_nonces;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS schema_migrations;

COMMIT;
