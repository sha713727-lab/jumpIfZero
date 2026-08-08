-- 0008_site_contact.up.sql
-- Singleton public contact details for Contact / About / invoices.
-- Apply as jz_owner.

BEGIN;

CREATE TABLE site_contact (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  singleton_key text NOT NULL DEFAULT 'default',
  email text NOT NULL,
  phone text NOT NULL,
  phone_href text NOT NULL DEFAULT '',
  address_label text NOT NULL DEFAULT '',
  address_line_1 text NOT NULL DEFAULT '',
  address_line_2 text NOT NULL DEFAULT '',
  address_line_3 text NOT NULL DEFAULT '',
  location_lede text NOT NULL DEFAULT '',
  map_embed_url text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_contact_singleton_key_unique UNIQUE (singleton_key),
  CONSTRAINT site_contact_singleton_key_check CHECK (singleton_key = 'default'),
  CONSTRAINT site_contact_email_len
    CHECK (char_length(email) >= 3 AND char_length(email) <= 320),
  CONSTRAINT site_contact_phone_len
    CHECK (char_length(phone) >= 1 AND char_length(phone) <= 64),
  CONSTRAINT site_contact_phone_href_len
    CHECK (char_length(phone_href) <= 128),
  CONSTRAINT site_contact_address_label_len
    CHECK (char_length(address_label) <= 200),
  CONSTRAINT site_contact_address_line_1_len
    CHECK (char_length(address_line_1) <= 300),
  CONSTRAINT site_contact_address_line_2_len
    CHECK (char_length(address_line_2) <= 300),
  CONSTRAINT site_contact_address_line_3_len
    CHECK (char_length(address_line_3) <= 300),
  CONSTRAINT site_contact_location_lede_len
    CHECK (char_length(location_lede) <= 500),
  CONSTRAINT site_contact_map_embed_url_len
    CHECK (char_length(map_embed_url) <= 2000),
  CONSTRAINT site_contact_version_pos CHECK (version >= 1)
);

INSERT INTO site_contact (
  email,
  phone,
  phone_href,
  address_label,
  address_line_1,
  address_line_2,
  address_line_3,
  location_lede,
  map_embed_url
) VALUES (
  'HR@jumpifzero.com',
  '0321-4433-514',
  'tel:+923214433514',
  'Studio',
  '55th Avenue Raiwind Rd,',
  'West Wood Colony Lahore',
  '',
  '55th Avenue Raiwind Rd, West Wood Colony Lahore.',
  'https://maps.google.com/maps?q=55th%20Avenue%20Raiwind%20Rd%2C%20West%20Wood%20Colony%20Lahore&z=15&output=embed'
);

GRANT SELECT, UPDATE ON site_contact TO jz_app;
GRANT SELECT ON site_contact TO jz_readonly;

COMMIT;
