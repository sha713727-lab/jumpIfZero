-- 0018_service_page_hierarchy.down.sql

BEGIN;

DROP VIEW IF EXISTS service_page_related_active;
DROP VIEW IF EXISTS service_page_comparison_points_active;
DROP VIEW IF EXISTS service_page_problems_active;
DROP VIEW IF EXISTS service_page_capabilities_active;
DROP VIEW IF EXISTS service_pages_active;

DROP TABLE IF EXISTS service_page_related;
DROP TABLE IF EXISTS service_page_comparison_points;
DROP TABLE IF EXISTS service_page_problems;
DROP TABLE IF EXISTS service_page_capabilities;

DROP INDEX IF EXISTS service_pages_parent_sort_idx;

ALTER TABLE service_pages
  DROP CONSTRAINT IF EXISTS service_pages_comparison_body_len,
  DROP CONSTRAINT IF EXISTS service_pages_comparison_heading_len,
  DROP CONSTRAINT IF EXISTS service_pages_problems_intro_len,
  DROP CONSTRAINT IF EXISTS service_pages_problems_heading_len,
  DROP CONSTRAINT IF EXISTS service_pages_capabilities_intro_len,
  DROP CONSTRAINT IF EXISTS service_pages_capabilities_heading_len;

ALTER TABLE service_pages
  DROP COLUMN IF EXISTS comparison_body,
  DROP COLUMN IF EXISTS comparison_heading,
  DROP COLUMN IF EXISTS problems_intro,
  DROP COLUMN IF EXISTS problems_heading,
  DROP COLUMN IF EXISTS capabilities_intro,
  DROP COLUMN IF EXISTS capabilities_heading,
  DROP COLUMN IF EXISTS sort_order,
  DROP COLUMN IF EXISTS parent_id;

CREATE VIEW service_pages_active AS
SELECT * FROM service_pages WHERE archived_at IS NULL;

GRANT SELECT ON service_pages_active TO jz_app;
GRANT SELECT ON service_pages_active TO jz_readonly;

COMMIT;
