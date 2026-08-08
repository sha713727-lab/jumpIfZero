-- 0005_site_sections.up.sql
-- Homepage / about visual CMS: gallery images, testimonials, principles.
-- Apply as jz_owner.

BEGIN;

CREATE TABLE site_gallery_images (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  section_key text NOT NULL,
  image_path text NOT NULL DEFAULT '',
  alt_text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT site_gallery_images_section_key_check
    CHECK (section_key IN ('about_gallery', 'studio_flow')),
  CONSTRAINT site_gallery_images_image_path_len
    CHECK (char_length(image_path) <= 1024),
  CONSTRAINT site_gallery_images_alt_text_len
    CHECK (char_length(alt_text) <= 500),
  CONSTRAINT site_gallery_images_version_pos CHECK (version >= 1)
);

CREATE INDEX site_gallery_images_section_sort_idx
  ON site_gallery_images (section_key, sort_order, id)
  WHERE archived_at IS NULL;

CREATE TABLE site_testimonials (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  quote text NOT NULL,
  author_name text NOT NULL,
  role_title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  accent text NOT NULL DEFAULT 'brand',
  image_path text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT site_testimonials_quote_len
    CHECK (char_length(quote) >= 1 AND char_length(quote) <= 2000),
  CONSTRAINT site_testimonials_author_name_len
    CHECK (char_length(author_name) >= 1 AND char_length(author_name) <= 200),
  CONSTRAINT site_testimonials_role_title_len
    CHECK (char_length(role_title) <= 200),
  CONSTRAINT site_testimonials_company_len
    CHECK (char_length(company) <= 200),
  CONSTRAINT site_testimonials_accent_check
    CHECK (accent IN ('brand', 'secondary', 'dark')),
  CONSTRAINT site_testimonials_image_path_len
    CHECK (char_length(image_path) <= 1024),
  CONSTRAINT site_testimonials_version_pos CHECK (version >= 1)
);

CREATE INDEX site_testimonials_sort_idx
  ON site_testimonials (sort_order, id)
  WHERE archived_at IS NULL;

CREATE TABLE site_principles (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  index_label text NOT NULL DEFAULT '',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  accent text NOT NULL DEFAULT 'brand',
  image_path text NOT NULL DEFAULT '',
  image_alt text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT site_principles_index_label_len
    CHECK (char_length(index_label) <= 16),
  CONSTRAINT site_principles_title_len
    CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT site_principles_body_len
    CHECK (char_length(body) <= 5000),
  CONSTRAINT site_principles_accent_check
    CHECK (accent IN ('brand', 'secondary')),
  CONSTRAINT site_principles_image_path_len
    CHECK (char_length(image_path) <= 1024),
  CONSTRAINT site_principles_image_alt_len
    CHECK (char_length(image_alt) <= 500),
  CONSTRAINT site_principles_version_pos CHECK (version >= 1)
);

CREATE INDEX site_principles_sort_idx
  ON site_principles (sort_order, id)
  WHERE archived_at IS NULL;

CREATE VIEW site_gallery_images_active AS
SELECT * FROM site_gallery_images WHERE archived_at IS NULL;

CREATE VIEW site_testimonials_active AS
SELECT * FROM site_testimonials WHERE archived_at IS NULL;

CREATE VIEW site_principles_active AS
SELECT * FROM site_principles WHERE archived_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  site_gallery_images,
  site_testimonials,
  site_principles
TO jz_app;

GRANT SELECT ON
  site_gallery_images_active,
  site_testimonials_active,
  site_principles_active
TO jz_app;

GRANT SELECT ON
  site_gallery_images,
  site_testimonials,
  site_principles,
  site_gallery_images_active,
  site_testimonials_active,
  site_principles_active
TO jz_readonly;

COMMIT;
