-- 0011_user_image_path.down.sql

BEGIN;

ALTER TABLE users
  DROP COLUMN IF EXISTS image_path;

COMMIT;
