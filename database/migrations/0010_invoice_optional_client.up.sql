-- 0010_invoice_optional_client.up.sql
-- Allow invoices without a registered client (outsider Bill to).
-- Apply as jz_owner.

BEGIN;

ALTER TABLE invoices
  ALTER COLUMN client_id DROP NOT NULL;

COMMIT;
