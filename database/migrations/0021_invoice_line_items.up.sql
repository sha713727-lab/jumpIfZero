-- 0021_invoice_line_items.up.sql
-- Line items for invoices (description + amount).
-- Apply as jz_owner.

BEGIN;

CREATE TABLE invoice_line_items (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  invoice_id uuid NOT NULL
    REFERENCES invoices (id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric(14, 2) NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoice_line_items_description_len
    CHECK (char_length(description) >= 1 AND char_length(description) <= 500),
  CONSTRAINT invoice_line_items_amount_nonneg CHECK (amount >= 0)
);

CREATE INDEX invoice_line_items_invoice_sort_idx
  ON invoice_line_items (invoice_id, sort_order, id);

INSERT INTO invoice_line_items (invoice_id, description, amount, sort_order)
SELECT id, title, amount, 0
FROM invoices;

GRANT SELECT, INSERT, UPDATE, DELETE ON invoice_line_items TO jz_app;
GRANT SELECT ON invoice_line_items TO jz_readonly;

COMMIT;
