-- 0017_service_pages.up.sql
-- Pillar service landing pages (Custom Development first) + section child tables.
-- Apply as jz_owner.

BEGIN;

CREATE TABLE service_pages (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  slug text NOT NULL,
  title text NOT NULL,
  nav_label text NOT NULL DEFAULT '',
  meta_title text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  og_title text NOT NULL DEFAULT '',
  og_description text NOT NULL DEFAULT '',
  og_image_path text NOT NULL DEFAULT '',
  hero_eyebrow text NOT NULL DEFAULT '',
  hero_h1 text NOT NULL,
  hero_description text NOT NULL DEFAULT '',
  hero_primary_cta_label text NOT NULL DEFAULT '',
  hero_primary_cta_href text NOT NULL DEFAULT '',
  hero_secondary_cta_label text NOT NULL DEFAULT '',
  hero_secondary_cta_href text NOT NULL DEFAULT '',
  hero_image_path text NOT NULL DEFAULT '',
  intro_heading text NOT NULL DEFAULT '',
  intro_body text NOT NULL DEFAULT '',
  offerings_heading text NOT NULL DEFAULT '',
  build_heading text NOT NULL DEFAULT '',
  process_heading text NOT NULL DEFAULT '',
  technologies_heading text NOT NULL DEFAULT '',
  benefits_heading text NOT NULL DEFAULT '',
  benefits_intro text NOT NULL DEFAULT '',
  faqs_heading text NOT NULL DEFAULT '',
  cta_heading text NOT NULL DEFAULT '',
  cta_body text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '',
  cta_href text NOT NULL DEFAULT '',
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT service_pages_slug_len
    CHECK (char_length(slug) >= 1 AND char_length(slug) <= 200),
  CONSTRAINT service_pages_title_len
    CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT service_pages_nav_label_len
    CHECK (char_length(nav_label) <= 100),
  CONSTRAINT service_pages_meta_title_len
    CHECK (char_length(meta_title) <= 200),
  CONSTRAINT service_pages_meta_description_len
    CHECK (char_length(meta_description) <= 500),
  CONSTRAINT service_pages_og_title_len
    CHECK (char_length(og_title) <= 200),
  CONSTRAINT service_pages_og_description_len
    CHECK (char_length(og_description) <= 500),
  CONSTRAINT service_pages_og_image_path_len
    CHECK (char_length(og_image_path) <= 1024),
  CONSTRAINT service_pages_hero_eyebrow_len
    CHECK (char_length(hero_eyebrow) <= 100),
  CONSTRAINT service_pages_hero_h1_len
    CHECK (char_length(hero_h1) >= 1 AND char_length(hero_h1) <= 300),
  CONSTRAINT service_pages_hero_description_len
    CHECK (char_length(hero_description) <= 2000),
  CONSTRAINT service_pages_hero_primary_cta_label_len
    CHECK (char_length(hero_primary_cta_label) <= 100),
  CONSTRAINT service_pages_hero_primary_cta_href_len
    CHECK (char_length(hero_primary_cta_href) <= 512),
  CONSTRAINT service_pages_hero_secondary_cta_label_len
    CHECK (char_length(hero_secondary_cta_label) <= 100),
  CONSTRAINT service_pages_hero_secondary_cta_href_len
    CHECK (char_length(hero_secondary_cta_href) <= 512),
  CONSTRAINT service_pages_hero_image_path_len
    CHECK (char_length(hero_image_path) <= 1024),
  CONSTRAINT service_pages_intro_heading_len
    CHECK (char_length(intro_heading) <= 200),
  CONSTRAINT service_pages_intro_body_len
    CHECK (char_length(intro_body) <= 10000),
  CONSTRAINT service_pages_offerings_heading_len
    CHECK (char_length(offerings_heading) <= 200),
  CONSTRAINT service_pages_build_heading_len
    CHECK (char_length(build_heading) <= 200),
  CONSTRAINT service_pages_process_heading_len
    CHECK (char_length(process_heading) <= 200),
  CONSTRAINT service_pages_technologies_heading_len
    CHECK (char_length(technologies_heading) <= 200),
  CONSTRAINT service_pages_benefits_heading_len
    CHECK (char_length(benefits_heading) <= 200),
  CONSTRAINT service_pages_benefits_intro_len
    CHECK (char_length(benefits_intro) <= 2000),
  CONSTRAINT service_pages_faqs_heading_len
    CHECK (char_length(faqs_heading) <= 200),
  CONSTRAINT service_pages_cta_heading_len
    CHECK (char_length(cta_heading) <= 300),
  CONSTRAINT service_pages_cta_body_len
    CHECK (char_length(cta_body) <= 2000),
  CONSTRAINT service_pages_cta_label_len
    CHECK (char_length(cta_label) <= 100),
  CONSTRAINT service_pages_cta_href_len
    CHECK (char_length(cta_href) <= 512),
  CONSTRAINT service_pages_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX service_pages_slug_active_key
  ON service_pages (slug)
  WHERE archived_at IS NULL;

CREATE TABLE service_page_offerings (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  service_page_id uuid NOT NULL
    REFERENCES service_pages (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '',
  cta_href text NOT NULL DEFAULT '',
  image_path text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT service_page_offerings_title_len
    CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT service_page_offerings_description_len
    CHECK (char_length(description) <= 5000),
  CONSTRAINT service_page_offerings_cta_label_len
    CHECK (char_length(cta_label) <= 100),
  CONSTRAINT service_page_offerings_cta_href_len
    CHECK (char_length(cta_href) <= 512),
  CONSTRAINT service_page_offerings_image_path_len
    CHECK (char_length(image_path) <= 1024),
  CONSTRAINT service_page_offerings_version_pos CHECK (version >= 1)
);

CREATE INDEX service_page_offerings_page_sort_idx
  ON service_page_offerings (service_page_id, sort_order, id)
  WHERE archived_at IS NULL;

CREATE TABLE service_page_build_items (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  service_page_id uuid NOT NULL
    REFERENCES service_pages (id) ON DELETE CASCADE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT service_page_build_items_label_len
    CHECK (char_length(label) >= 1 AND char_length(label) <= 200),
  CONSTRAINT service_page_build_items_version_pos CHECK (version >= 1)
);

CREATE INDEX service_page_build_items_page_sort_idx
  ON service_page_build_items (service_page_id, sort_order, id)
  WHERE archived_at IS NULL;

CREATE TABLE service_page_process_steps (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  service_page_id uuid NOT NULL
    REFERENCES service_pages (id) ON DELETE CASCADE,
  step_number integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT service_page_process_steps_step_number_pos
    CHECK (step_number >= 1 AND step_number <= 99),
  CONSTRAINT service_page_process_steps_title_len
    CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT service_page_process_steps_body_len
    CHECK (char_length(body) <= 5000),
  CONSTRAINT service_page_process_steps_version_pos CHECK (version >= 1)
);

CREATE INDEX service_page_process_steps_page_sort_idx
  ON service_page_process_steps (service_page_id, sort_order, id)
  WHERE archived_at IS NULL;

CREATE TABLE service_page_technologies (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  service_page_id uuid NOT NULL
    REFERENCES service_pages (id) ON DELETE CASCADE,
  category text NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT service_page_technologies_category_check
    CHECK (category IN (
      'frontend',
      'backend',
      'mobile',
      'commerce',
      'database',
      'cloud'
    )),
  CONSTRAINT service_page_technologies_name_len
    CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT service_page_technologies_version_pos CHECK (version >= 1)
);

CREATE INDEX service_page_technologies_page_sort_idx
  ON service_page_technologies (service_page_id, sort_order, id)
  WHERE archived_at IS NULL;

CREATE TABLE service_page_benefits (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  service_page_id uuid NOT NULL
    REFERENCES service_pages (id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT service_page_benefits_title_len
    CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT service_page_benefits_body_len
    CHECK (char_length(body) <= 5000),
  CONSTRAINT service_page_benefits_version_pos CHECK (version >= 1)
);

CREATE INDEX service_page_benefits_page_sort_idx
  ON service_page_benefits (service_page_id, sort_order, id)
  WHERE archived_at IS NULL;

CREATE TABLE service_page_faqs (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  service_page_id uuid NOT NULL
    REFERENCES service_pages (id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT service_page_faqs_question_len
    CHECK (char_length(question) >= 1 AND char_length(question) <= 500),
  CONSTRAINT service_page_faqs_answer_len
    CHECK (char_length(answer) >= 1 AND char_length(answer) <= 10000),
  CONSTRAINT service_page_faqs_version_pos CHECK (version >= 1)
);

CREATE INDEX service_page_faqs_page_sort_idx
  ON service_page_faqs (service_page_id, sort_order, id)
  WHERE archived_at IS NULL;

CREATE VIEW service_pages_active AS
SELECT * FROM service_pages WHERE archived_at IS NULL;

CREATE VIEW service_page_offerings_active AS
SELECT * FROM service_page_offerings WHERE archived_at IS NULL;

CREATE VIEW service_page_build_items_active AS
SELECT * FROM service_page_build_items WHERE archived_at IS NULL;

CREATE VIEW service_page_process_steps_active AS
SELECT * FROM service_page_process_steps WHERE archived_at IS NULL;

CREATE VIEW service_page_technologies_active AS
SELECT * FROM service_page_technologies WHERE archived_at IS NULL;

CREATE VIEW service_page_benefits_active AS
SELECT * FROM service_page_benefits WHERE archived_at IS NULL;

CREATE VIEW service_page_faqs_active AS
SELECT * FROM service_page_faqs WHERE archived_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  service_pages,
  service_page_offerings,
  service_page_build_items,
  service_page_process_steps,
  service_page_technologies,
  service_page_benefits,
  service_page_faqs
TO jz_app;

GRANT SELECT ON
  service_pages_active,
  service_page_offerings_active,
  service_page_build_items_active,
  service_page_process_steps_active,
  service_page_technologies_active,
  service_page_benefits_active,
  service_page_faqs_active
TO jz_app;

GRANT SELECT ON
  service_pages,
  service_page_offerings,
  service_page_build_items,
  service_page_process_steps,
  service_page_technologies,
  service_page_benefits,
  service_page_faqs,
  service_pages_active,
  service_page_offerings_active,
  service_page_build_items_active,
  service_page_process_steps_active,
  service_page_technologies_active,
  service_page_benefits_active,
  service_page_faqs_active
TO jz_readonly;

COMMIT;
