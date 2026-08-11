-- Align public NAP phone format and ensure portfolio case studies are published.
-- Apply as jz_owner.

BEGIN;

UPDATE site_contact
SET
  phone = '+92 321-4433-514',
  phone_href = 'tel:+923214433514',
  address_line_1 = '55th Avenue Raiwind Rd,',
  address_line_2 = 'West Wood Colony Lahore',
  location_lede = '55th Avenue Raiwind Rd, West Wood Colony Lahore.',
  version = version + 1,
  updated_at = now()
WHERE singleton_key = 'default';

INSERT INTO portfolio_items (title, slug, category, summary, image_path, published_at)
SELECT v.title, v.slug, v.category, v.summary, v.image_path, now()
FROM (VALUES
  ('Growth-stage brand site', 'growth-stage-brand-site', 'Website Development', 'Architecture, UX, and front-end as one conversion system.', '/images/services/website.jpg'),
  ('Internal ops platform', 'internal-ops-platform', 'Software Development', 'Workflow-mapped product with maintainable APIs.', '/images/services/software.jpg'),
  ('Retention-first mobile app', 'retention-first-mobile-app', 'App Development', 'Clear journeys and launch-ready builds.', '/images/services/app.jpg'),
  ('Intent-led SEO program', 'intent-led-seo-program', 'SEO', 'Rank where customers already search.', '/images/services/seo.jpg'),
  ('Social growth system', 'social-growth-system', 'Digital Marketing', 'Attention that turns into action.', '/images/services/smm.jpg'),
  ('Premium brand identity', 'premium-brand-identity', 'Graphic Designing', 'Design that speaks before you do.', '/images/services/design.jpg')
) AS v(title, slug, category, summary, image_path)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_items p WHERE p.slug = v.slug AND p.archived_at IS NULL
);

UPDATE portfolio_items
SET
  published_at = COALESCE(published_at, now()),
  archived_at = NULL,
  version = version + 1,
  updated_at = now()
WHERE slug IN (
  'growth-stage-brand-site',
  'internal-ops-platform',
  'retention-first-mobile-app',
  'intent-led-seo-program',
  'social-growth-system',
  'premium-brand-identity'
)
AND (
  published_at IS NULL
  OR archived_at IS NOT NULL
);

INSERT INTO services (title, slug, description, path, image_path, published_at)
SELECT v.title, v.slug, v.description, v.path, v.image_path, now()
FROM (VALUES
  ('Website Development', 'website-development', 'Conversion-first websites engineered to sell.', '/services', '/images/services/website.jpg'),
  ('Software Development', 'software-development', 'Custom software that fits your workflow.', '/services', '/images/services/software.jpg'),
  ('App Development', 'app-development', 'Mobile apps built for speed and clarity.', '/services', '/images/services/app.jpg'),
  ('SEO', 'seo', 'SEO that targets intent, not vanity keywords.', '/services', '/images/services/seo.jpg'),
  ('Digital Marketing', 'digital-marketing', 'Social content that earns attention.', '/services', '/images/services/smm.jpg'),
  ('Graphic Design', 'graphic-design', 'Brand systems with sharp visual craft.', '/services', '/images/services/design.jpg'),
  ('Cyber Security', 'cyber-security', 'Hardening and monitoring that holds.', '/images/services/security.jpg'),
  ('Fix Bug & Error', 'fix-bug-error', 'Diagnose, fix, and stabilize production.', '/services', '/images/services/bugfix.jpg')
) AS v(title, slug, description, path, image_path)
WHERE NOT EXISTS (
  SELECT 1 FROM services s WHERE s.slug = v.slug AND s.archived_at IS NULL
);

UPDATE services
SET
  published_at = COALESCE(published_at, now()),
  archived_at = NULL,
  version = version + 1,
  updated_at = now()
WHERE slug IN (
  'website-development',
  'software-development',
  'app-development',
  'seo',
  'digital-marketing',
  'graphic-design',
  'cyber-security',
  'fix-bug-error'
)
AND (
  published_at IS NULL
  OR archived_at IS NOT NULL
);

COMMIT;
