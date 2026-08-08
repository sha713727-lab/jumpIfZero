-- Production site-section bootstrap. Idempotent.

BEGIN;

INSERT INTO site_gallery_images (section_key, image_path, alt_text, sort_order, published_at)
SELECT v.section_key, v.image_path, v.alt_text, v.sort_order, now()
FROM (VALUES
  ('about_gallery', '/images/hero-office.png', 'JumpIfZero work', 10),
  ('about_gallery', '/images/hero-team.png', 'JumpIfZero work', 20),
  ('about_gallery', '/images/hero-visual.png', 'JumpIfZero work', 30),
  ('about_gallery', '/images/welcome-hero.png', 'JumpIfZero work', 40),
  ('about_gallery', '/images/services/website.jpg', 'JumpIfZero work', 50),
  ('about_gallery', '/images/services/software.jpg', 'JumpIfZero work', 60),
  ('about_gallery', '/images/services/app.jpg', 'JumpIfZero work', 70),
  ('about_gallery', '/images/services/seo.jpg', 'JumpIfZero work', 80),
  ('about_gallery', '/images/services/smm.jpg', 'JumpIfZero work', 90),
  ('about_gallery', '/images/services/design.jpg', 'JumpIfZero work', 100),
  ('studio_flow', '/images/hero-office.png', 'Studio work', 10),
  ('studio_flow', '/images/services/website.jpg', 'Studio work', 20),
  ('studio_flow', '/images/services/website-b.jpg', 'Studio work', 30),
  ('studio_flow', '/images/services/software.jpg', 'Studio work', 40),
  ('studio_flow', '/images/services/app.jpg', 'Studio work', 50),
  ('studio_flow', '/images/hero-team.png', 'Studio work', 60),
  ('studio_flow', '/images/services/seo.jpg', 'Studio work', 70),
  ('studio_flow', '/images/services/design.jpg', 'Studio work', 80),
  ('studio_flow', '/images/welcome-hero.png', 'Studio work', 90)
) AS v(section_key, image_path, alt_text, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM site_gallery_images_active g
  WHERE g.section_key = v.section_key AND g.image_path = v.image_path
);

INSERT INTO site_testimonials (
  quote, author_name, role_title, company, accent, image_path, sort_order, published_at
)
SELECT v.quote, v.author_name, v.role_title, v.company, v.accent, v.image_path, v.sort_order, now()
FROM (VALUES
  (
    'JZ didn’t hand us a template. They rebuilt our entire digital system — and revenue followed within the first quarter.',
    'Maya Thompson', 'CEO', 'Northline Commerce', 'brand', '/images/hero-team.png', 10
  ),
  (
    'The site feels expensive in the best way. Load times dropped, conversions climbed, and our team finally has a stack we trust.',
    'Daniel Okonkwo', 'Founder', 'Atlas Logistics', 'secondary', '/images/hero-office.png', 20
  ),
  (
    'From brand to campaign to software — one partner, one standard. That alone saved us months of agency chaos.',
    'Priya Shah', 'CMO', 'Lumen Health', 'dark', '/images/welcome-hero.png', 30
  ),
  (
    'They treat every pixel and every funnel like it matters. Our launch looked world-class and performed even better.',
    'Chris Alvarez', 'Product Lead', 'Forge Studio', 'brand', '/images/hero-visual.png', 40
  ),
  (
    'Communication stayed sharp from kickoff to handoff. We always knew what was shipping next — and why.',
    'Elena Brooks', 'Operations Director', 'Harbor Retail', 'secondary', '/images/hero-team.png', 50
  ),
  (
    'A true growth partner. Design, code, and marketing finally moved as one system instead of three disconnected vendors.',
    'Omar Hassan', 'Managing Partner', 'Vertex Advisory', 'dark', '/images/hero-office.png', 60
  )
) AS v(quote, author_name, role_title, company, accent, image_path, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM site_testimonials_active t WHERE t.author_name = v.author_name AND t.company = v.company
);

INSERT INTO site_principles (
  index_label, title, body, accent, image_path, image_alt, sort_order, published_at
)
SELECT v.index_label, v.title, v.body, v.accent, v.image_path, v.image_alt, v.sort_order, now()
FROM (VALUES
  (
    '01',
    'One system, not scattered vendors',
    'Strategy, design, development, and growth run as one owned pipeline — so launches stay sharp and rebuilds stay coherent.',
    'brand',
    '/images/services/software.jpg',
    'Software systems work',
    10
  ),
  (
    '02',
    'Built for conversion',
    'Every surface is shaped to attract the right audience and turn attention into measurable growth — not vanity deliverables.',
    'secondary',
    '/images/services/website.jpg',
    'Website conversion work',
    20
  ),
  (
    '03',
    'Clear ownership',
    'Direct process language, defined scope, and outcomes you can scale. No agency fog.',
    'brand',
    '/images/hero-team.png',
    'JumpIfZero team collaboration',
    30
  )
) AS v(index_label, title, body, accent, image_path, image_alt, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM site_principles_active p WHERE p.title = v.title
);

COMMIT;
