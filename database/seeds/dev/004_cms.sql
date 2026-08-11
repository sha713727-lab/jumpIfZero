-- Dev seeds only. Synthetic CMS content. Never load in production.

BEGIN;

INSERT INTO services (title, slug, description, path, image_path, published_at)
SELECT v.title, v.slug, v.description, v.path, v.image_path, now()
FROM (VALUES
  ('Website Development', 'website-development', 'Conversion-first websites engineered to sell.', '/services', '/images/services/website.jpg'),
  ('Software Development', 'software-development', 'Custom software that fits your workflow.', '/services', '/images/services/software.jpg'),
  ('App Development', 'app-development', 'Mobile apps built for speed and clarity.', '/services', '/images/services/app.jpg'),
  ('SEO', 'seo', 'SEO that targets intent, not vanity keywords.', '/services', '/images/services/seo.jpg'),
  ('Digital Marketing', 'digital-marketing', 'Social content that earns attention.', '/services', '/images/services/smm.jpg'),
  ('Graphic Design', 'graphic-design', 'Brand systems with sharp visual craft.', '/services', '/images/services/design.jpg'),
  ('Cyber Security', 'cyber-security', 'Hardening and monitoring that holds.', '/services', '/images/services/security.jpg'),
  ('Fix Bug & Error', 'fix-bug-error', 'Diagnose, fix, and stabilize production.', '/services', '/images/services/bugfix.jpg')
) AS v(title, slug, description, path, image_path)
WHERE NOT EXISTS (
  SELECT 1 FROM services_active s WHERE s.slug = v.slug
);

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
  SELECT 1 FROM portfolio_items_active p WHERE p.slug = v.slug
);

INSERT INTO blog_posts (title, slug, excerpt, body, image_path, category, published_at)
SELECT v.title, v.slug, v.excerpt, v.body, v.image_path, v.category, now()
FROM (VALUES
  (
    'Ship the system, not the slide deck',
    'ship-the-system',
    'Why scoped delivery beats endless discovery.',
    'We build the growth system you will run — websites, software, apps, and the channels around them — with ownership from first wireframe to launch.',
    '/images/services/website.jpg',
    'Delivery'
  ),
  (
    'SEO that maps to pipeline',
    'seo-that-maps-to-pipeline',
    'Intent over vanity rankings.',
    'Technical foundations and content structure so search traffic becomes leads, not a vanity chart.',
    '/images/services/seo.jpg',
    'Growth'
  )
) AS v(title, slug, excerpt, body, image_path, category)
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts_active b WHERE b.slug = v.slug
);

INSERT INTO faqs (question, answer, sort_order, published_at)
SELECT v.question, v.answer, v.sort_order, now()
FROM (VALUES
  ('How do engagements start?', 'Send a brief with goals, constraints, and current state. We reply with a clear next step.', 10),
  ('Do you rebuild or extend existing systems?', 'Both. We keep what works, replace what blocks growth, and leave you with ownership.', 20),
  ('What does a typical timeline look like?', 'Scoped phases with visible milestones — not open-ended retainers without outcomes.', 30)
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM faqs_active f WHERE f.question = v.question
);

INSERT INTO team_members (name, role_title, bio, image_path, sort_order, published_at)
SELECT v.name, v.role_title, v.bio, v.image_path, v.sort_order, now()
FROM (VALUES
  ('Dev Owner', 'Founder', 'Leads product and delivery for JumpIfZero.', '/images/services/design.jpg', 10),
  ('Dev Delivery', 'Delivery Lead', 'Owns client delivery and technical execution.', '/images/services/software.jpg', 20)
) AS v(name, role_title, bio, image_path, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM team_members_active t WHERE t.name = v.name AND t.role_title = v.role_title
);

COMMIT;
