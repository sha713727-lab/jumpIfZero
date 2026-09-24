-- 0022_portfolio_marquee_gallery.up.sql
-- Add portfolio page hero marquee gallery section.
-- Apply as jz_owner.

BEGIN;

ALTER TABLE site_gallery_images
  DROP CONSTRAINT site_gallery_images_section_key_check;

ALTER TABLE site_gallery_images
  ADD CONSTRAINT site_gallery_images_section_key_check
  CHECK (section_key IN (
    'about_gallery',
    'studio_flow',
    'services_fan',
    'portfolio_marquee'
  ));

COMMIT;
