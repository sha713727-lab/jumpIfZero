-- Dev seed: Custom Development pillar page (customer-facing copy only).
-- Requires migration 0017_service_pages.

BEGIN;

INSERT INTO service_pages (
  slug,
  title,
  nav_label,
  meta_title,
  meta_description,
  og_title,
  og_description,
  og_image_path,
  hero_eyebrow,
  hero_h1,
  hero_description,
  hero_primary_cta_label,
  hero_primary_cta_href,
  hero_secondary_cta_label,
  hero_secondary_cta_href,
  hero_image_path,
  intro_heading,
  intro_body,
  offerings_heading,
  build_heading,
  process_heading,
  technologies_heading,
  benefits_heading,
  benefits_intro,
  faqs_heading,
  cta_heading,
  cta_body,
  cta_label,
  cta_href,
  published_at
)
SELECT
  'custom-development',
  'Custom Development',
  'Custom Development',
  'Custom Development Services | JZ Enterprises',
  'Custom websites, web apps, mobile apps, e-commerce platforms, and software solutions tailored to your workflows, users, and growth goals.',
  'Custom Development Services | JZ Enterprises',
  'Turn complex ideas into reliable digital products with custom development from Jump If Zero.',
  '/images/services/software.jpg',
  'Custom Development',
  'Custom Development Services Built Around Your Business',
  'Turn complex ideas into reliable digital products. Jump If Zero designs and develops custom websites, web applications, mobile apps, e-commerce platforms, and software solutions tailored to your workflows, users, and growth goals.',
  'Discuss Your Project',
  '/contact',
  'View Our Work',
  '/portfolio',
  '/images/services/software.jpg',
  'Built around how you work',
  'Off-the-shelf products rarely match specialized workflows. Jump If Zero designs and develops digital products around your requirements, users, and operating model — so the system fits the business, not the other way around.',
  'Custom Development Services',
  'What Can We Build?',
  'Our Custom Development Process',
  'Technologies We Work With',
  'Why Businesses Choose Custom Development',
  'Custom development gives you room to grow, integrate, and evolve without fighting a rigid product mold.',
  'Frequently Asked Questions',
  'Ready to scope a custom build?',
  'Tell us what you need to ship. We will reply with a clear next step.',
  'Start a scoped engagement',
  '/contact',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM service_pages_active p WHERE p.slug = 'custom-development'
);

UPDATE service_pages
SET
  hero_image_path = '/images/services/software.jpg',
  og_image_path = '/images/services/software.jpg',
  updated_at = now()
WHERE slug = 'custom-development'
  AND archived_at IS NULL
  AND (
    hero_image_path IS DISTINCT FROM '/images/services/software.jpg'
    OR og_image_path IS DISTINCT FROM '/images/services/software.jpg'
  );

WITH page AS (
  SELECT id FROM service_pages_active WHERE slug = 'custom-development' LIMIT 1
)
INSERT INTO service_page_offerings (
  service_page_id, title, description, cta_label, cta_href, image_path, sort_order, published_at
)
SELECT page.id, v.title, v.description, v.cta_label, v.cta_href, v.image_path, v.sort_order, now()
FROM page
CROSS JOIN (VALUES
  (
    'Web Development',
    'Fast, scalable and responsive websites built for performance, usability and business growth. From corporate websites to complex platforms, we develop experiences that work across devices and support your long-term goals.',
    'Explore Web Development',
    '/services/custom-development/web-development',
    '/images/services/website.jpg',
    10
  ),
  (
    'Mobile App Development',
    'Custom iOS, Android and cross-platform applications designed around real user needs and business objectives.',
    'Explore Mobile App Development',
    '/services/custom-development/mobile-app-development',
    '/images/services/app.jpg',
    20
  ),
  (
    'Custom Software Development',
    'Software designed specifically around your operations, workflows and requirements—from internal management systems to customer-facing platforms.',
    'Explore Custom Software Development',
    '/services/custom-development/custom-software-development',
    '/images/services/software.jpg',
    30
  ),
  (
    'Web Application Development',
    'Scalable browser-based applications, SaaS products, portals, dashboards and business systems engineered for modern users.',
    'Explore Web App Development',
    '/services/custom-development/web-app-development',
    '/images/services/software-b.jpg',
    40
  ),
  (
    'E-commerce Development',
    'High-performance online stores and custom commerce experiences designed to make products easier to discover, purchase and manage.',
    'Explore E-commerce Development',
    '/services/custom-development/ecommerce-development',
    '/images/services/design.jpg',
    50
  )
) AS v(title, description, cta_label, cta_href, image_path, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM service_page_offerings_active o
  WHERE o.service_page_id = page.id AND o.title = v.title
);

UPDATE service_page_offerings o
SET
  image_path = v.image_path,
  updated_at = now()
FROM service_pages_active p
CROSS JOIN (VALUES
  ('Web Development', '/images/services/website.jpg'),
  ('Mobile App Development', '/images/services/app.jpg'),
  ('Custom Software Development', '/images/services/software.jpg'),
  ('Web Application Development', '/images/services/software-b.jpg'),
  ('E-commerce Development', '/images/services/design.jpg')
) AS v(title, image_path)
WHERE o.service_page_id = p.id
  AND p.slug = 'custom-development'
  AND o.archived_at IS NULL
  AND o.title = v.title
  AND o.image_path IS DISTINCT FROM v.image_path;

WITH page AS (
  SELECT id FROM service_pages_active WHERE slug = 'custom-development' LIMIT 1
)
INSERT INTO service_page_build_items (
  service_page_id, label, sort_order, published_at
)
SELECT page.id, v.label, v.sort_order, now()
FROM page
CROSS JOIN (VALUES
  ('SaaS platforms', 10),
  ('Customer portals', 20),
  ('Business websites', 30),
  ('E-commerce stores', 40),
  ('CRM systems', 50),
  ('Booking platforms', 60),
  ('Dashboards', 70),
  ('Internal tools', 80),
  ('Mobile apps', 90),
  ('API integrations', 100),
  ('Workflow automation', 110),
  ('Membership platforms', 120),
  ('Management systems', 130)
) AS v(label, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM service_page_build_items_active b
  WHERE b.service_page_id = page.id AND b.label = v.label
);

WITH page AS (
  SELECT id FROM service_pages_active WHERE slug = 'custom-development' LIMIT 1
)
INSERT INTO service_page_process_steps (
  service_page_id, step_number, title, body, sort_order, published_at
)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, now()
FROM page
CROSS JOIN (VALUES
  (1, 'Discovery & Requirements', 'We clarify goals, constraints, users, and what success looks like before design or code begins.', 10),
  (2, 'Planning & Architecture', 'We map the system shape, integrations, and delivery plan so the build stays coherent as it grows.', 20),
  (3, 'UI/UX & Prototyping', 'Interfaces and flows are designed around real tasks — then validated before heavy implementation.', 30),
  (4, 'Development', 'We implement the product as a maintainable system: clear ownership, solid foundations, room to iterate.', 40),
  (5, 'Testing & Quality Assurance', 'We verify behavior, edge cases, and release readiness so launches are deliberate — not hopeful.', 50),
  (6, 'Deployment', 'We ship with a controlled release path and handoff notes your team can operate.', 60),
  (7, 'Support & Improvement', 'After launch, we help stabilize, refine, and extend the product as requirements evolve.', 70)
) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM service_page_process_steps_active s
  WHERE s.service_page_id = page.id AND s.title = v.title
);

WITH page AS (
  SELECT id FROM service_pages_active WHERE slug = 'custom-development' LIMIT 1
)
INSERT INTO service_page_benefits (
  service_page_id, title, body, sort_order, published_at
)
SELECT page.id, v.title, v.body, v.sort_order, now()
FROM page
CROSS JOIN (VALUES
  ('Scalability', 'Build for today without boxing yourself into tomorrow’s limits — architecture that can grow with demand.', 10),
  ('Integrations', 'Connect the tools you already use so data and workflows stay connected across the business.', 20),
  ('Ownership and control', 'You retain a product shaped around your needs, not a rented feature set you cannot redirect.', 30),
  ('Tailored workflows', 'Screens, roles, and automation follow how your team actually works.', 40),
  ('Automation opportunities', 'Reduce repetitive work by encoding rules and handoffs into the product itself.', 50),
  ('Room to evolve', 'As requirements change, the system can extend without starting from zero.', 60)
) AS v(title, body, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM service_page_benefits_active b
  WHERE b.service_page_id = page.id AND b.title = v.title
);

WITH page AS (
  SELECT id FROM service_pages_active WHERE slug = 'custom-development' LIMIT 1
)
INSERT INTO service_page_faqs (
  service_page_id, question, answer, sort_order, published_at
)
SELECT page.id, v.question, v.answer, v.sort_order, now()
FROM page
CROSS JOIN (VALUES
  (
    'What is custom development?',
    'Custom development is the process of designing and building software, websites or applications around the specific requirements of a business rather than relying entirely on an off-the-shelf solution.',
    10
  )
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM service_page_faqs_active f
  WHERE f.service_page_id = page.id AND f.question = v.question
);

COMMIT;
