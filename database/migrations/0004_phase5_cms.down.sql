DROP INDEX IF EXISTS portfolio_items_slug_active_key;

ALTER TABLE portfolio_items
  DROP CONSTRAINT IF EXISTS portfolio_items_slug_len;

ALTER TABLE portfolio_items
  DROP COLUMN IF EXISTS slug;

ALTER TABLE faqs
  DROP COLUMN IF EXISTS sort_order;

ALTER TABLE team_members
  DROP COLUMN IF EXISTS sort_order;

CREATE OR REPLACE VIEW portfolio_items_active AS
SELECT * FROM portfolio_items WHERE archived_at IS NULL;

CREATE OR REPLACE VIEW faqs_active AS
SELECT * FROM faqs WHERE archived_at IS NULL;

CREATE OR REPLACE VIEW team_members_active AS
SELECT * FROM team_members WHERE archived_at IS NULL;
