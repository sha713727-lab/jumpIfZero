-- Reverse 0014_site_contact_socials.up.sql
-- Apply as jz_owner.

BEGIN;

ALTER TABLE site_contact
  DROP CONSTRAINT IF EXISTS site_contact_social_linkedin_url_len,
  DROP CONSTRAINT IF EXISTS site_contact_social_instagram_url_len,
  DROP CONSTRAINT IF EXISTS site_contact_social_facebook_url_len,
  DROP CONSTRAINT IF EXISTS site_contact_social_x_url_len;

ALTER TABLE site_contact
  DROP COLUMN IF EXISTS social_linkedin_url,
  DROP COLUMN IF EXISTS social_instagram_url,
  DROP COLUMN IF EXISTS social_facebook_url,
  DROP COLUMN IF EXISTS social_x_url;

COMMIT;
