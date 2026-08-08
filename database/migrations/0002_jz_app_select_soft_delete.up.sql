-- 0002_jz_app_select_soft_delete.up.sql
-- PostgreSQL requires SELECT to evaluate UPDATE/DELETE WHERE and SET expressions.
-- Application reads remain on *_active views; this restores write capability for jz_app.
-- Apply as jz_owner.

BEGIN;

GRANT SELECT ON
  users,
  clients,
  employees,
  services,
  portfolio_items,
  blog_posts,
  faqs,
  team_members,
  projects,
  invoices,
  messages,
  files,
  carriers,
  parties,
  sales,
  leads,
  callbacks,
  contact_messages
TO jz_app;

COMMIT;
