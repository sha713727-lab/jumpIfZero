-- Phase 5 CMS: portfolio slug + FAQ/team sort_order

ALTER TABLE portfolio_items
  ADD COLUMN slug text;

UPDATE portfolio_items
SET slug = 'item-' || replace(id::text, '-', '')
WHERE slug IS NULL;

ALTER TABLE portfolio_items
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE portfolio_items
  ADD CONSTRAINT portfolio_items_slug_len
  CHECK (char_length(slug) >= 1 AND char_length(slug) <= 200);

CREATE UNIQUE INDEX portfolio_items_slug_active_key
  ON portfolio_items (slug)
  WHERE archived_at IS NULL;

ALTER TABLE faqs
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

ALTER TABLE team_members
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

CREATE OR REPLACE VIEW portfolio_items_active AS
SELECT * FROM portfolio_items WHERE archived_at IS NULL;

CREATE OR REPLACE VIEW faqs_active AS
SELECT * FROM faqs WHERE archived_at IS NULL;

CREATE OR REPLACE VIEW team_members_active AS
SELECT * FROM team_members WHERE archived_at IS NULL;
