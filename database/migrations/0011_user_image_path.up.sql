-- 0011_user_image_path.up.sql
-- Profile photo path for admin/client users (employees use employees.image_path).
-- Apply as jz_owner.

BEGIN;

ALTER TABLE users
  ADD COLUMN image_path text NOT NULL DEFAULT '';

COMMIT;
