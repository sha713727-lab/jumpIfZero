-- Reverse 0013_public_cms_nap.up.sql
-- Apply as jz_owner.

BEGIN;

UPDATE site_contact
SET
  phone = '0321-4433-514',
  phone_href = 'tel:+923214433514',
  version = version + 1,
  updated_at = now()
WHERE singleton_key = 'default';

COMMIT;
