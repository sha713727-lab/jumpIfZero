-- 0022_portfolio_marquee_gallery.down.sql

BEGIN;

UPDATE site_gallery_images
SET archived_at = COALESCE(archived_at, now()),
    updated_at = now()
WHERE section_key = 'portfolio_marquee'
  AND archived_at IS NULL;

ALTER TABLE site_gallery_images
  DROP CONSTRAINT site_gallery_images_section_key_check;

ALTER TABLE site_gallery_images
  ADD CONSTRAINT site_gallery_images_section_key_check
  CHECK (section_key IN ('about_gallery', 'studio_flow', 'services_fan'));

COMMIT;
