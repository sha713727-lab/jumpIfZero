-- 0005_site_sections.down.sql
-- Apply as jz_owner.

BEGIN;

DROP VIEW IF EXISTS site_principles_active;
DROP VIEW IF EXISTS site_testimonials_active;
DROP VIEW IF EXISTS site_gallery_images_active;

DROP TABLE IF EXISTS site_principles;
DROP TABLE IF EXISTS site_testimonials;
DROP TABLE IF EXISTS site_gallery_images;

COMMIT;
