-- 0009_invoice_party_snapshot.down.sql
-- Apply as jz_owner.

BEGIN;

ALTER TABLE invoices
  DROP CONSTRAINT IF EXISTS invoices_bill_to_company_len,
  DROP CONSTRAINT IF EXISTS invoices_bill_to_name_len,
  DROP CONSTRAINT IF EXISTS invoices_bill_to_email_len,
  DROP CONSTRAINT IF EXISTS invoices_bill_to_phone_len,
  DROP CONSTRAINT IF EXISTS invoices_bill_to_location_len,
  DROP CONSTRAINT IF EXISTS invoices_from_company_len,
  DROP CONSTRAINT IF EXISTS invoices_from_email_len,
  DROP CONSTRAINT IF EXISTS invoices_from_phone_len;

ALTER TABLE invoices
  DROP COLUMN IF EXISTS bill_to_company,
  DROP COLUMN IF EXISTS bill_to_name,
  DROP COLUMN IF EXISTS bill_to_email,
  DROP COLUMN IF EXISTS bill_to_phone,
  DROP COLUMN IF EXISTS bill_to_location,
  DROP COLUMN IF EXISTS from_company,
  DROP COLUMN IF EXISTS from_email,
  DROP COLUMN IF EXISTS from_phone;

COMMIT;
