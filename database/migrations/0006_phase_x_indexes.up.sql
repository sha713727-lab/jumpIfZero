-- 0006_phase_x_indexes.up.sql
-- Justified btree/partial indexes for equality filters, FK lookups, and sort paths.
-- Does not add pg_trgm (leading-wildcard ILIKE remains seq-scan until extension approved).

BEGIN;

CREATE INDEX IF NOT EXISTS leads_status_code_active_idx
  ON leads (status_code, id)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS invoices_status_code_active_idx
  ON invoices (status_code, created_at, id)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS contact_messages_status_created_active_idx
  ON contact_messages (status_code, created_at, id)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS callbacks_status_created_active_idx
  ON callbacks (status_code, created_at, id)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS clients_status_code_active_idx
  ON clients (status_code, created_at, id)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS sales_messages_from_rep_id_idx
  ON sales_messages (from_rep_id, sent_at);

CREATE INDEX IF NOT EXISTS sales_insurance_party_id_idx
  ON sales (insurance_party_id)
  WHERE insurance_party_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS sales_factoring_party_id_idx
  ON sales (factoring_party_id)
  WHERE factoring_party_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS parties_kind_active_idx
  ON parties (kind, id)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS users_role_active_idx
  ON users (role, id)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS faqs_sort_order_active_idx
  ON faqs (sort_order, id)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS team_members_sort_order_active_idx
  ON team_members (sort_order, id)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS blog_posts_published_at_active_idx
  ON blog_posts (published_at DESC, id)
  WHERE archived_at IS NULL AND published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS sessions_revoked_at_idx
  ON sessions (revoked_at)
  WHERE revoked_at IS NOT NULL;

COMMIT;
