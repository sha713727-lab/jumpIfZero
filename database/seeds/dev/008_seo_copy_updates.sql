BEGIN;

UPDATE service_pages SET
  meta_title = 'Custom Development Services | Software, Web & Apps',
  meta_description = 'Custom software development, web development, mobile apps, and e-commerce platforms from JZ Enterprises — built around your workflows and growth goals.',
  og_title = 'Custom Development Services | JZ Enterprises',
  og_description = 'Custom software, websites, web apps, and mobile products scoped as one delivery practice.',
  hero_h1 = 'Custom Software and Web Development Built Around Your Business',
  hero_description = 'JZ Enterprises designs and ships custom software development, professional web development, mobile apps, and e-commerce platforms tailored to your workflows, users, and growth goals.',
  intro_heading = 'Software development services that fit how you work',
  intro_body = 'Off-the-shelf products rarely match specialized workflows. Jump If Zero designs and develops digital products around your requirements — custom software, websites, web applications, and mobile apps — so the system fits the business.',
  hero_secondary_cta_label = 'Read custom software insights',
  hero_secondary_cta_href = '/blog/what-is-custom-software-development',
  version = version + 1,
  updated_at = now()
WHERE slug = 'custom-development' AND archived_at IS NULL
  AND (meta_title IS DISTINCT FROM 'Custom Development Services | Software, Web & Apps');

UPDATE service_pages SET
  meta_title = 'Web Development Services | JZ Enterprises',
  meta_description = 'Professional web development services for business and marketing sites — performance, clarity, and conversion paths your team can maintain.',
  og_title = 'Web Development Services | JZ Enterprises',
  og_description = 'Custom websites engineered for speed, usability, and how you sell.',
  hero_h1 = 'Web Development Services Built for Performance and Clarity',
  hero_description = 'Ship website development that loads quickly, works across devices, and supports how you sell — not a generic theme stretched past its limits.',
  intro_heading = 'What web development services mean here',
  intro_body = 'Web development is the design and build of your public site as a durable product: information architecture, content templates, forms, and integrations your team can operate after launch. See also our guide on what web development is and how website projects are scoped.',
  hero_secondary_cta_label = 'Website development cost guide',
  hero_secondary_cta_href = '/blog/website-development-cost',
  version = version + 1,
  updated_at = now()
WHERE slug = 'web-development' AND archived_at IS NULL;

UPDATE service_pages SET
  meta_title = 'Mobile App Development Services | JZ Enterprises',
  meta_description = 'Mobile app development services for iOS, Android, Flutter, and React Native — products scoped around real user tasks and maintainable delivery.',
  og_title = 'Mobile App Development Services | JZ Enterprises',
  og_description = 'Custom mobile app development with clear platform choices and release ownership.',
  hero_h1 = 'Mobile App Development Services Built Around Real User Tasks',
  hero_description = 'Design and ship iOS, Android, and cross-platform mobile apps people can use with confidence — focused on clarity, reliability, and maintainable delivery.',
  intro_heading = 'What mobile app development means',
  intro_body = 'Mobile app development is building software people use on phones and tablets. We start from user tasks and operating constraints, then choose native or cross-platform delivery that fits your product and team.',
  hero_secondary_cta_label = 'Mobile app development process',
  hero_secondary_cta_href = '/blog/mobile-app-development-process',
  version = version + 1,
  updated_at = now()
WHERE slug = 'mobile-app-development' AND archived_at IS NULL;

UPDATE service_pages SET
  meta_title = 'Custom Software Development Company | JZ Enterprises',
  meta_description = 'Custom software development services for internal systems and customer platforms — workflows, integrations, and ownership designed around your operations.',
  og_title = 'Custom Software Development | JZ Enterprises',
  og_description = 'Purpose-built software shaped around roles, data, and the workflows that run your company.',
  hero_h1 = 'Custom Software Development Shaped Around Your Operations',
  hero_description = 'Build custom software development solutions that match how your teams work — with room to integrate, automate, and evolve without forcing a generic product onto unique processes.',
  intro_heading = 'What custom software development means',
  intro_body = 'Custom software development is purpose-built for your processes instead of forcing the business into a generic product. We design around roles, data, and the workflows that actually run the company. Read our overview of what custom software development is and when it beats off-the-shelf tools.',
  hero_secondary_cta_label = 'What is custom software?',
  hero_secondary_cta_href = '/blog/what-is-custom-software-development',
  comparison_heading = 'Custom software vs off-the-shelf software',
  comparison_body = 'Off-the-shelf tools ship faster when your process already fits. Custom software is the better fit when workflows, permissions, or integrations are unique enough that configuring a product becomes a permanent compromise. See our deeper comparison for decision factors.',
  version = version + 1,
  updated_at = now()
WHERE slug = 'custom-software-development' AND archived_at IS NULL;

UPDATE service_pages SET
  meta_title = 'Custom Web Application Development | JZ Enterprises',
  meta_description = 'Custom web application development for portals, dashboards, and browser-based products — engineered for modern users and maintainable delivery.',
  og_title = 'Custom Web Application Development | JZ Enterprises',
  og_description = 'Web apps and portals built around real workflows, not brochure pages.',
  hero_h1 = 'Custom Web Application Development for Real Workflows',
  hero_description = 'Build custom web app development products — portals, dashboards, and SaaS-style applications — engineered for the jobs your users actually perform.',
  intro_heading = 'What custom web application development covers',
  intro_body = 'Custom web application development is more than a marketing site. It is authenticated product work: roles, data views, workflows, and integrations that teams rely on every day.',
  hero_secondary_cta_label = 'Back to Custom Development',
  hero_secondary_cta_href = '/services/custom-development',
  version = version + 1,
  updated_at = now()
WHERE slug = 'web-app-development' AND archived_at IS NULL;

UPDATE service_pages SET
  meta_title = 'E-commerce Development Services | JZ Enterprises',
  meta_description = 'E-commerce development for storefronts and commerce workflows — catalog, checkout, and operations shaped around how you sell.',
  og_title = 'E-commerce Development | JZ Enterprises',
  og_description = 'Commerce platforms built for catalog clarity, checkout reliability, and operational ownership.',
  hero_h1 = 'E-commerce Development Built Around How You Sell',
  hero_description = 'Launch or rebuild e-commerce software experiences with catalog structure, checkout reliability, and the operational flows your team needs after go-live.',
  intro_heading = 'E-commerce software development that fits operations',
  intro_body = 'E-commerce development is product work: catalog rules, checkout, payments, fulfillment hooks, and content patterns your team can run without fighting the platform.',
  hero_secondary_cta_label = 'Back to Custom Development',
  hero_secondary_cta_href = '/services/custom-development',
  version = version + 1,
  updated_at = now()
WHERE slug = 'ecommerce-development' AND archived_at IS NULL;

UPDATE service_pages SET
  meta_title = 'SEO Services | Technical, Local & AEO | JZ Enterprises',
  meta_description = 'Technical SEO, local SEO, international SEO, e-commerce SEO, and GEO/AEO — search systems tied to pipeline, not vanity rankings.',
  version = version + 1,
  updated_at = now()
WHERE slug = 'seo' AND archived_at IS NULL;

UPDATE service_pages SET
  meta_title = 'Digital Marketing Services | JZ Enterprises',
  meta_description = 'PPC, social, content, email, and conversion optimization — campaigns measured against conversations and qualified demand.',
  version = version + 1,
  updated_at = now()
WHERE slug = 'digital-marketing' AND archived_at IS NULL;

UPDATE service_pages SET
  meta_title = 'UI/UX and Brand Design Services | JZ Enterprises',
  meta_description = 'UI/UX design, web design, graphic design, and brand identity — clear systems ready for handoff and real product use.',
  version = version + 1,
  updated_at = now()
WHERE slug = 'design' AND archived_at IS NULL;

UPDATE service_pages SET
  meta_title = 'Cyber Security Services | JZ Enterprises',
  meta_description = 'Web application security, vulnerability assessment, hardening, and monitoring — practical protection for products you operate.',
  version = version + 1,
  updated_at = now()
WHERE slug = 'cyber-security' AND archived_at IS NULL;

WITH page AS (SELECT id, published_at FROM service_pages WHERE slug = 'custom-software-development' AND archived_at IS NULL LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page
CROSS JOIN (VALUES
  ('How much does custom software development cost?', 'Cost depends on scope, integrations, and how many roles the system must support. After discovery we share a scoped range with assumptions — not a one-size quote. See our cost guide for typical drivers.', 30),
  ('What is the custom software development process?', 'We move from discovery and workflow mapping into design, incremental build, testing, and handoff. Milestones stay reviewable so scope does not drift silently.', 40)
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM service_page_faqs f
  WHERE f.service_page_id = page.id AND f.question = v.question AND f.archived_at IS NULL
);

WITH page AS (SELECT id, published_at FROM service_pages WHERE slug = 'web-development' AND archived_at IS NULL LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page
CROSS JOIN (VALUES
  ('How much does website development cost?', 'Website cost tracks page count, content readiness, design depth, and integrations. A focused marketing site differs from a content system with many templates. We scope after a short discovery.', 30),
  ('What is the difference between a website and a web application?', 'A website primarily publishes and converts. A web application supports logged-in workflows, roles, and ongoing product use. We help you choose the right shape before build.', 40)
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM service_page_faqs f
  WHERE f.service_page_id = page.id AND f.question = v.question AND f.archived_at IS NULL
);

WITH page AS (SELECT id, published_at FROM service_pages WHERE slug = 'mobile-app-development' AND archived_at IS NULL LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page
CROSS JOIN (VALUES
  ('Should we build native or cross-platform?', 'Native fits deep platform needs or distinct iOS/Android experiences. Cross-platform fits when one product can share most UI and logic. We decide from device needs, timeline, and ownership — not fashion.', 30),
  ('How does the mobile app development process work?', 'Discovery and task mapping come first, then experience design, incremental build, hardening, and launch support with a practical checklist.', 40)
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM service_page_faqs f
  WHERE f.service_page_id = page.id AND f.question = v.question AND f.archived_at IS NULL
);

COMMIT;
