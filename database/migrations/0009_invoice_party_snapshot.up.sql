-- 0009_invoice_party_snapshot.up.sql
-- Per-invoice Bill to / From snapshot fields for print and PDF.
-- Apply as jz_owner.

BEGIN;

ALTER TABLE invoices
  ADD COLUMN bill_to_company text NOT NULL DEFAULT '',
  ADD COLUMN bill_to_name text NOT NULL DEFAULT '',
  ADD COLUMN bill_to_email text NOT NULL DEFAULT '',
  ADD COLUMN bill_to_phone text NOT NULL DEFAULT '',
  ADD COLUMN bill_to_location text NOT NULL DEFAULT '',
  ADD COLUMN from_company text NOT NULL DEFAULT '',
  ADD COLUMN from_email text NOT NULL DEFAULT '',
  ADD COLUMN from_phone text NOT NULL DEFAULT '';

ALTER TABLE invoices
  ADD CONSTRAINT invoices_bill_to_company_len
    CHECK (char_length(bill_to_company) <= 200),
  ADD CONSTRAINT invoices_bill_to_name_len
    CHECK (char_length(bill_to_name) <= 200),
  ADD CONSTRAINT invoices_bill_to_email_len
    CHECK (char_length(bill_to_email) <= 320),
  ADD CONSTRAINT invoices_bill_to_phone_len
    CHECK (char_length(bill_to_phone) <= 64),
  ADD CONSTRAINT invoices_bill_to_location_len
    CHECK (char_length(bill_to_location) <= 200),
  ADD CONSTRAINT invoices_from_company_len
    CHECK (char_length(from_company) <= 200),
  ADD CONSTRAINT invoices_from_email_len
    CHECK (char_length(from_email) <= 320),
  ADD CONSTRAINT invoices_from_phone_len
    CHECK (char_length(from_phone) <= 64);

UPDATE invoices i
SET
  bill_to_company = c.company,
  bill_to_name = COALESCE(u.name, ''),
  bill_to_email = COALESCE(u.email, ''),
  bill_to_phone = c.phone,
  bill_to_location = c.location,
  from_company = 'JZ Enterprises',
  from_email = COALESCE(sc.email, ''),
  from_phone = COALESCE(sc.phone, '')
FROM clients c
JOIN users u ON u.id = c.user_id
LEFT JOIN site_contact sc ON sc.singleton_key = 'default'
WHERE i.client_id = c.id;

COMMIT;
