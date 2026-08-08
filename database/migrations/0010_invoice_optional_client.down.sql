-- 0010_invoice_optional_client.down.sql
-- Apply as jz_owner.
-- Fails if any invoice has client_id NULL.

BEGIN;

ALTER TABLE invoices
  ALTER COLUMN client_id SET NOT NULL;

COMMIT;
