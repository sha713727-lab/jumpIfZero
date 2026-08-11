-- Add optional social profile URLs to site_contact for public footer icons.
-- Apply as jz_owner.

BEGIN;

ALTER TABLE site_contact
  ADD COLUMN social_linkedin_url text NOT NULL DEFAULT '',
  ADD COLUMN social_instagram_url text NOT NULL DEFAULT '',
  ADD COLUMN social_facebook_url text NOT NULL DEFAULT '',
  ADD COLUMN social_x_url text NOT NULL DEFAULT '';

ALTER TABLE site_contact
  ADD CONSTRAINT site_contact_social_linkedin_url_len
    CHECK (char_length(social_linkedin_url) <= 500),
  ADD CONSTRAINT site_contact_social_instagram_url_len
    CHECK (char_length(social_instagram_url) <= 500),
  ADD CONSTRAINT site_contact_social_facebook_url_len
    CHECK (char_length(social_facebook_url) <= 500),
  ADD CONSTRAINT site_contact_social_x_url_len
    CHECK (char_length(social_x_url) <= 500);

COMMIT;
