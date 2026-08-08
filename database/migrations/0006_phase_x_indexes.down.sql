-- 0006_phase_x_indexes.down.sql

BEGIN;

DROP INDEX IF EXISTS sessions_revoked_at_idx;
DROP INDEX IF EXISTS blog_posts_published_at_active_idx;
DROP INDEX IF EXISTS team_members_sort_order_active_idx;
DROP INDEX IF EXISTS faqs_sort_order_active_idx;
DROP INDEX IF EXISTS users_role_active_idx;
DROP INDEX IF EXISTS parties_kind_active_idx;
DROP INDEX IF EXISTS sales_factoring_party_id_idx;
DROP INDEX IF EXISTS sales_insurance_party_id_idx;
DROP INDEX IF EXISTS sales_messages_from_rep_id_idx;
DROP INDEX IF EXISTS clients_status_code_active_idx;
DROP INDEX IF EXISTS callbacks_status_created_active_idx;
DROP INDEX IF EXISTS contact_messages_status_created_active_idx;
DROP INDEX IF EXISTS invoices_status_code_active_idx;
DROP INDEX IF EXISTS leads_status_code_active_idx;

COMMIT;
