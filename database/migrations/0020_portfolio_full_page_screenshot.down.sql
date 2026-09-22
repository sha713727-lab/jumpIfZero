BEGIN;

DROP VIEW IF EXISTS portfolio_items_active;

ALTER TABLE portfolio_items
  DROP CONSTRAINT IF EXISTS portfolio_items_website_url_len,
  DROP CONSTRAINT IF EXISTS portfolio_items_full_page_image_path_len,
  DROP CONSTRAINT IF EXISTS portfolio_items_full_page_image_alt_len;

ALTER TABLE portfolio_items
  DROP COLUMN IF EXISTS website_url,
  DROP COLUMN IF EXISTS full_page_image_path,
  DROP COLUMN IF EXISTS full_page_image_alt,
  DROP COLUMN IF EXISTS screenshot_captured_at;

CREATE OR REPLACE VIEW portfolio_items_active AS
SELECT * FROM portfolio_items WHERE archived_at IS NULL;

COMMIT;
