-- 0002_jz_app_select_soft_delete.down.sql
-- Reverse of 0002. Apply as jz_owner.

BEGIN;

REVOKE SELECT ON
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
FROM jz_app;

COMMIT;
