-- 0019_services_fan_gallery.up.sql
-- Add services page hero fan card gallery section.
-- Apply as jz_owner.

BEGIN;

ALTER TABLE site_gallery_images
  DROP CONSTRAINT site_gallery_images_section_key_check;

ALTER TABLE site_gallery_images
  ADD CONSTRAINT site_gallery_images_section_key_check
  CHECK (section_key IN ('about_gallery', 'studio_flow', 'services_fan'));

COMMIT;
