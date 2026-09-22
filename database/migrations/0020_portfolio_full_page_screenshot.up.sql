BEGIN;

ALTER TABLE portfolio_items
  ADD COLUMN website_url text NOT NULL DEFAULT '',
  ADD COLUMN full_page_image_path text NOT NULL DEFAULT '',
  ADD COLUMN full_page_image_alt text NOT NULL DEFAULT '',
  ADD COLUMN screenshot_captured_at timestamptz;

ALTER TABLE portfolio_items
  ADD CONSTRAINT portfolio_items_website_url_len
    CHECK (char_length(website_url) <= 2048),
  ADD CONSTRAINT portfolio_items_full_page_image_path_len
    CHECK (char_length(full_page_image_path) <= 1024),
  ADD CONSTRAINT portfolio_items_full_page_image_alt_len
    CHECK (char_length(full_page_image_alt) <= 300);

CREATE OR REPLACE VIEW portfolio_items_active AS
SELECT * FROM portfolio_items WHERE archived_at IS NULL;

COMMIT;
