-- 0018_service_page_hierarchy.up.sql
-- Parent/child service pages + capabilities, problems, comparison, related.
-- Apply as jz_owner.

BEGIN;

DROP VIEW IF EXISTS service_pages_active;

ALTER TABLE service_pages
  ADD COLUMN parent_id uuid
    REFERENCES service_pages (id) ON DELETE CASCADE,
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN capabilities_heading text NOT NULL DEFAULT '',
  ADD COLUMN capabilities_intro text NOT NULL DEFAULT '',
  ADD COLUMN problems_heading text NOT NULL DEFAULT '',
  ADD COLUMN problems_intro text NOT NULL DEFAULT '',
  ADD COLUMN comparison_heading text NOT NULL DEFAULT '',
  ADD COLUMN comparison_body text NOT NULL DEFAULT '';

ALTER TABLE service_pages
  ADD CONSTRAINT service_pages_capabilities_heading_len
    CHECK (char_length(capabilities_heading) <= 200),
  ADD CONSTRAINT service_pages_capabilities_intro_len
    CHECK (char_length(capabilities_intro) <= 2000),
  ADD CONSTRAINT service_pages_problems_heading_len
    CHECK (char_length(problems_heading) <= 200),
  ADD CONSTRAINT service_pages_problems_intro_len
    CHECK (char_length(problems_intro) <= 2000),
  ADD CONSTRAINT service_pages_comparison_heading_len
    CHECK (char_length(comparison_heading) <= 200),
  ADD CONSTRAINT service_pages_comparison_body_len
    CHECK (char_length(comparison_body) <= 10000);

CREATE INDEX service_pages_parent_sort_idx
  ON service_pages (parent_id, sort_order, id)
  WHERE archived_at IS NULL;

CREATE VIEW service_pages_active AS
SELECT * FROM service_pages WHERE archived_at IS NULL;

CREATE TABLE service_page_capabilities (
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
  CONSTRAINT service_page_capabilities_title_len
    CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT service_page_capabilities_body_len
    CHECK (char_length(body) <= 5000),
  CONSTRAINT service_page_capabilities_version_pos CHECK (version >= 1)
);

CREATE INDEX service_page_capabilities_page_sort_idx
  ON service_page_capabilities (service_page_id, sort_order, id)
  WHERE archived_at IS NULL;

CREATE TABLE service_page_problems (
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
  CONSTRAINT service_page_problems_title_len
    CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT service_page_problems_body_len
    CHECK (char_length(body) <= 5000),
  CONSTRAINT service_page_problems_version_pos CHECK (version >= 1)
);

CREATE INDEX service_page_problems_page_sort_idx
  ON service_page_problems (service_page_id, sort_order, id)
  WHERE archived_at IS NULL;

CREATE TABLE service_page_comparison_points (
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
  CONSTRAINT service_page_comparison_points_title_len
    CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT service_page_comparison_points_body_len
    CHECK (char_length(body) <= 5000),
  CONSTRAINT service_page_comparison_points_version_pos CHECK (version >= 1)
);

CREATE INDEX service_page_comparison_points_page_sort_idx
  ON service_page_comparison_points (service_page_id, sort_order, id)
  WHERE archived_at IS NULL;

CREATE TABLE service_page_related (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  service_page_id uuid NOT NULL
    REFERENCES service_pages (id) ON DELETE CASCADE,
  related_service_page_id uuid NOT NULL
    REFERENCES service_pages (id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT service_page_related_not_self
    CHECK (service_page_id <> related_service_page_id),
  CONSTRAINT service_page_related_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX service_page_related_pair_active_key
  ON service_page_related (service_page_id, related_service_page_id)
  WHERE archived_at IS NULL;

CREATE INDEX service_page_related_page_sort_idx
  ON service_page_related (service_page_id, sort_order, id)
  WHERE archived_at IS NULL;

CREATE VIEW service_page_capabilities_active AS
SELECT * FROM service_page_capabilities WHERE archived_at IS NULL;

CREATE VIEW service_page_problems_active AS
SELECT * FROM service_page_problems WHERE archived_at IS NULL;

CREATE VIEW service_page_comparison_points_active AS
SELECT * FROM service_page_comparison_points WHERE archived_at IS NULL;

CREATE VIEW service_page_related_active AS
SELECT * FROM service_page_related WHERE archived_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  service_page_capabilities,
  service_page_problems,
  service_page_comparison_points,
  service_page_related
TO jz_app;

GRANT SELECT ON
  service_pages_active,
  service_page_capabilities_active,
  service_page_problems_active,
  service_page_comparison_points_active,
  service_page_related_active
TO jz_app;

GRANT SELECT ON
  service_page_capabilities,
  service_page_problems,
  service_page_comparison_points,
  service_page_related,
  service_pages_active,
  service_page_capabilities_active,
  service_page_problems_active,
  service_page_comparison_points_active,
  service_page_related_active
TO jz_readonly;

COMMIT;
