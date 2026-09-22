-- Dev seed: service page hierarchy (pillars + children + sections).
-- Requires migrations 0017_service_pages and 0018_service_page_hierarchy.

BEGIN;

-- Pillars

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'custom-development', 'Custom Development', 'Custom Development', 'Custom Development Services | JZ Enterprises', 'Custom websites, web apps, mobile apps, e-commerce platforms, and software solutions tailored to your workflows, users, and growth goals.', 'Custom Development Services | JZ Enterprises', 'Custom websites, web apps, mobile apps, e-commerce platforms, and software solutions tailored to your workflows, users, and growth goals.', '/images/services/software.jpg',
  'Custom Development', 'Custom Development Services Built Around Your Business', 'Turn complex ideas into reliable digital products. Jump If Zero designs and develops custom websites, web applications, mobile apps, e-commerce platforms, and software solutions tailored to your workflows, users, and growth goals.', 'Discuss Your Project', '/contact', 'View Our Work', '/portfolio', '/images/services/software.jpg',
  'Built around how you work', 'Off-the-shelf products rarely match specialized workflows. Jump If Zero designs and develops digital products around your requirements, users, and operating model — so the system fits the business, not the other way around.', 'Services', 'What Can We Build?', 'Our Custom Development Process', 'Technologies We Work With', 'Why Businesses Choose Custom Development', 'Custom development gives you room to grow, integrate, and evolve without fighting a rigid product mold.',
  'Frequently Asked Questions', 'Ready to scope a custom build?', 'Tell us what you need to ship. We will reply with a clear next step.', 'Start a scoped engagement', '/contact', '', '', '',
  '', '', '', NULL, 10, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'custom-development');

UPDATE service_pages SET
  title = 'Custom Development', nav_label = 'Custom Development',
  meta_title = 'Custom Development Services | JZ Enterprises',
  meta_description = 'Custom websites, web apps, mobile apps, e-commerce platforms, and software solutions tailored to your workflows, users, and growth goals.',
  og_title = 'Custom Development Services | JZ Enterprises',
  og_description = 'Custom websites, web apps, mobile apps, e-commerce platforms, and software solutions tailored to your workflows, users, and growth goals.',
  og_image_path = '/images/services/software.jpg', hero_eyebrow = 'Custom Development',
  hero_h1 = 'Custom Development Services Built Around Your Business',
  hero_description = 'Turn complex ideas into reliable digital products. Jump If Zero designs and develops custom websites, web applications, mobile apps, e-commerce platforms, and software solutions tailored to your workflows, users, and growth goals.',
  hero_primary_cta_label = 'Discuss Your Project', hero_primary_cta_href = '/contact',
  hero_secondary_cta_label = 'View Our Work', hero_secondary_cta_href = '/portfolio',
  hero_image_path = '/images/services/software.jpg',
  intro_heading = 'Built around how you work',
  intro_body = 'Off-the-shelf products rarely match specialized workflows. Jump If Zero designs and develops digital products around your requirements, users, and operating model — so the system fits the business, not the other way around.',
  offerings_heading = 'Services',
  capabilities_heading = '', capabilities_intro = '', problems_heading = '', problems_intro = '',
  comparison_heading = '', comparison_body = '',
  parent_id = NULL, sort_order = 10, published_at = now(), updated_at = now()
WHERE slug = 'custom-development' AND archived_at IS NULL;

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'seo', 'SEO', 'SEO', 'SEO Services | JZ Enterprises', 'Technical, local, international, and e-commerce SEO plus GEO and AEO content work that helps customers find and understand you.', 'SEO Services | JZ Enterprises', 'Technical, local, international, and e-commerce SEO plus GEO and AEO content work that helps customers find and understand you.', '/images/services/seo.jpg',
  'SEO', 'SEO That Makes Your Business Easier to Find and Trust', 'Improve how search engines and answer engines understand your site. We focus on structure, clarity, and useful content — without ranking promises.', 'Discuss Your Project', '/contact', 'View Our Work', '/portfolio', '/images/services/seo.jpg',
  'What SEO means here', 'SEO is the practice of making your site clear, crawlable, and useful so people can discover the right pages when they search. We treat it as durable site quality work, not a ranking guarantee.', 'Services', '', '', '', '', '',
  '', 'Want a clearer SEO plan?', 'Share your site and goals. We will outline a practical next step.', 'Start a conversation', '/contact', '', '', '',
  '', '', '', NULL, 20, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'seo');

UPDATE service_pages SET parent_id = NULL, sort_order = 20, published_at = COALESCE(published_at, now()), updated_at = now() WHERE slug = 'seo' AND archived_at IS NULL;

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'digital-marketing', 'Digital Marketing', 'Digital Marketing', 'Digital Marketing Services | JZ Enterprises', 'PPC, social, content, email, and conversion work designed around clear offers and measurable campaigns.', 'Digital Marketing Services | JZ Enterprises', 'PPC, social, content, email, and conversion work designed around clear offers and measurable campaigns.', '/images/services/smm.jpg',
  'Digital Marketing', 'Digital Marketing Built Around Real Offers', 'Reach the right people with campaigns and content that match how you sell. We help you plan, launch, and improve channels without invented performance claims.', 'Discuss Your Project', '/contact', 'View Our Work', '/portfolio', '/images/services/smm.jpg',
  'What digital marketing covers', 'Digital marketing is how you attract and convert attention online — paid media, social, content, email, and conversion improvements working together around your offer.', 'Services', '', '', '', '', '',
  '', 'Ready to review your channels?', 'Tell us where demand comes from today. We will suggest a focused next step.', 'Start a conversation', '/contact', '', '', '',
  '', '', '', NULL, 30, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'digital-marketing');

UPDATE service_pages SET parent_id = NULL, sort_order = 30, published_at = COALESCE(published_at, now()), updated_at = now() WHERE slug = 'digital-marketing' AND archived_at IS NULL;

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'design', 'Design', 'Design', 'Design Services | JZ Enterprises', 'UI/UX, web, graphic, and brand identity design that clarifies your product and makes interfaces easier to use.', 'Design Services | JZ Enterprises', 'UI/UX, web, graphic, and brand identity design that clarifies your product and makes interfaces easier to use.', '/images/services/design.jpg',
  'Design', 'Design That Clarifies Products and Brands', 'From interfaces to identity systems, we design so people understand what you offer and how to act next.', 'Discuss Your Project', '/contact', 'View Our Work', '/portfolio', '/images/services/design.jpg',
  'What design means here', 'Design is how structure, visuals, and interaction come together so users can understand and trust your product. We focus on clarity and usable systems your team can extend.', 'Services', '', '', '', '', '',
  '', 'Need design for a product or brand?', 'Share the problem you need solved. We will reply with a clear next step.', 'Start a conversation', '/contact', '', '', '',
  '', '', '', NULL, 40, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'design');

UPDATE service_pages SET parent_id = NULL, sort_order = 40, published_at = COALESCE(published_at, now()), updated_at = now() WHERE slug = 'design' AND archived_at IS NULL;

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'cyber-security', 'Cyber Security', 'Cyber Security', 'Cyber Security Services | JZ Enterprises', 'Web application security, assessments, testing, hardening, and practical monitoring sized to your systems and risk.', 'Cyber Security Services | JZ Enterprises', 'Web application security, assessments, testing, hardening, and practical monitoring sized to your systems and risk.', '/images/services/security.jpg',
  'Cyber Security', 'Cyber Security Work Sized to Your Systems', 'Reduce avoidable risk with focused assessments, hardening, and monitoring. We stay practical — no invented certifications or round-the-clock operations claims.', 'Discuss Your Project', '/contact', 'View Our Work', '/portfolio', '/images/services/security.jpg',
  'What cyber security covers', 'Cyber security here means finding weaknesses, fixing what matters, and keeping agreed systems in a healthier state over time. Scope follows your stack and risk, not a one-size playbook.', 'Services', '', '', '', '', '',
  '', 'Want a security review?', 'Tell us what you run and what concerns you. We will propose a scoped next step.', 'Start a conversation', '/contact', '', '', '',
  '', '', '', NULL, 50, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'cyber-security');

UPDATE service_pages SET parent_id = NULL, sort_order = 50, published_at = COALESCE(published_at, now()), updated_at = now() WHERE slug = 'cyber-security' AND archived_at IS NULL;

-- Children

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'web-development', 'Web Development', 'Web Development', 'Web Development Services | JZ Enterprises', 'Fast, scalable websites built for performance, usability, and business growth.', 'Web Development Services | JZ Enterprises', 'Fast, scalable websites built for performance, usability, and business growth.', '/images/services/website.jpg',
  'Web Development', 'Web Development Built for Performance and Clarity', 'Ship a website that loads quickly, works across devices, and supports how you sell.', 'Discuss Your Project', '/contact', 'Back to Custom Development', '/services/custom-development', '/images/services/website.jpg',
  'What web development means here', 'Web development is the design and build of your public site as a durable product — structure, content templates, forms, and integrations your team can operate after launch.', '', '', 'How a website engagement runs', '', 'Why custom web development', 'Own a site that fits your sales motion instead of stretching a generic theme.',
  'Web development FAQs', 'Ready to scope a website?', 'Tell us what the site needs to do. We will reply with a clear next step.', 'Start a conversation', '/contact', 'What we deliver', 'Practical website work that balances brand, speed, and maintainability.', 'Problems we solve',
  'Common website issues that slow growth or create avoidable rework.', 'Custom website vs template website', 'Templates can get you online quickly. A custom website is shaped around your offer, content model, and conversion paths so you are not fighting a fixed layout as the business grows.', (SELECT id FROM service_pages_active WHERE slug = 'custom-development' LIMIT 1), 10, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'web-development');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-development' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Corporate and marketing sites', 'Clear page structure, responsive layouts, and content patterns your team can update.', 10), ('Performance-minded front ends', 'Lean pages and sensible assets that feel fast on real devices.', 20), ('Forms and integrations', 'Contact and lead flows connected to the tools you already use.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-development' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Sites that look fine but do not convert', 'Visitors cannot find the offer or next step. We restructure pages around real buyer tasks.', 10), ('Slow or fragile pages', 'Heavy themes create drag. We simplify the foundation and ship cleaner pages.', 20), ('Handoffs nobody can maintain', 'We leave templates and notes your team can extend.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-development' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Discovery', 'Clarify goals, audiences, and content inventory before design begins.', 10), (2, 'Information architecture', 'Map pages, navigation, and templates so content has a durable home.', 20), (3, 'Design and prototyping', 'Shape layouts around real tasks, then validate key flows.', 30), (4, 'Build and integrate', 'Implement the site, forms, and integrations with room to iterate.', 40), (5, 'Launch and handoff', 'Ship with QA and notes your team can operate.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-development' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Fits your offer', 'Pages follow how you sell, not a theme demo.', 10), ('Room to grow', 'Add sections and content types without starting over.', 20), ('Clear ownership', 'You leave with a maintainable site, not a black box.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-development' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Custom website', 'Built around your content model, brand, and conversion paths.', 10), ('Template website', 'Faster start, but layouts and features are constrained by the theme.', 20), ('When templates still fit', 'Simple brochure needs with stable content can start on a template.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-development' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('How long does a website project take?', 'Timelines depend on page count, content readiness, and integrations. After discovery we share a scoped plan.', 10), ('Will we be able to update the site ourselves?', 'Yes. We structure templates so your team can make routine updates safely.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'mobile-app-development', 'Mobile App Development', 'Mobile App Development', 'Mobile App Development | JZ Enterprises', 'iOS, Android, and cross-platform apps designed around real user tasks and business goals.', 'Mobile App Development | JZ Enterprises', 'iOS, Android, and cross-platform apps designed around real user tasks and business goals.', '/images/services/app.jpg',
  'Mobile App Development', 'Mobile Apps Built Around Real User Tasks', 'Design and ship mobile products that people can use with confidence — focused on clarity, reliability, and maintainable delivery.', 'Discuss Your Project', '/contact', 'Back to Custom Development', '/services/custom-development', '/images/services/app.jpg',
  'What mobile app development means', 'Mobile app development is building software people use on phones and tablets. We start from user tasks and operating constraints, then choose a delivery approach that fits your product and team.', '', '', 'How a mobile engagement runs', '', 'Why build a custom mobile app', 'Own a product shaped around your workflows instead of stretching a generic template.',
  'Mobile app FAQs', 'Ready to scope a mobile app?', 'Share the jobs your app must do. We will outline a practical next step.', 'Start a conversation', '/contact', 'What we deliver', 'Practical mobile product work from discovery through release readiness.', 'Problems we solve',
  'Common mobile product risks that waste budget or frustrate users.', 'Native vs cross-platform', 'Native apps use platform toolchains for deep device integration. Cross-platform approaches share more code across iOS and Android when one product experience can serve both.', (SELECT id FROM service_pages_active WHERE slug = 'custom-development' LIMIT 1), 20, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'mobile-app-development');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'mobile-app-development' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Product discovery and UX flows', 'Map core journeys before heavy build so the app solves the right jobs.', 10), ('iOS and Android delivery', 'Ship maintainable apps with clear release and handoff practices.', 20), ('Integrations and accounts', 'Connect authentication, APIs, and notifications your product needs.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'mobile-app-development' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Apps that feel unfinished after launch', 'Unclear scope creates thrash. We lock a first release around essential tasks.', 10), ('Platform sprawl without a plan', 'We help you choose native or shared approaches based on product needs.', 20), ('Hard-to-support releases', 'We leave build notes and ownership paths your team can continue.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'mobile-app-development' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Discovery', 'Clarify users, jobs, constraints, and success criteria.', 10), (2, 'Experience design', 'Prototype key flows and validate them before full build.', 20), (3, 'Build', 'Implement features in focused increments with reviewable milestones.', 30), (4, 'Test and harden', 'Cover critical paths, edge cases, and release readiness.', 40), (5, 'Launch support', 'Ship with a practical checklist and handoff notes.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'mobile-app-development' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Task-first product', 'Features follow real user jobs, not feature checklists.', 10), ('Honest platform choice', 'Native or cross-platform based on fit, not fashion.', 20), ('Sustainable ownership', 'Clear structure for future updates.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'mobile-app-development' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Native', 'Best when you need deep platform behavior or distinct iOS/Android experiences.', 10), ('Cross-platform', 'Useful when one product can share most UI and logic across platforms.', 20), ('How we decide', 'We weigh device needs, team skills, timeline, and long-term ownership.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'mobile-app-development' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you build for both iOS and Android?', 'Yes, when the product needs both. We confirm scope and approach during discovery.', 10), ('Can you work with an existing design system?', 'Yes. We can adopt your system or help establish one for the app.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'custom-software-development', 'Custom Software Development', 'Custom Software', 'Custom Software Development | JZ Enterprises', 'Software designed around your operations, workflows, and integrations — from internal systems to customer platforms.', 'Custom Software Development | JZ Enterprises', 'Software designed around your operations, workflows, and integrations — from internal systems to customer platforms.', '/images/services/software.jpg',
  'Custom Software Development', 'Custom Software Shaped Around Your Operations', 'Build systems that match how your teams work — with room to integrate, automate, and evolve.', 'Discuss Your Project', '/contact', 'Back to Custom Development', '/services/custom-development', '/images/services/software.jpg',
  'What custom software means', 'Custom software is purpose-built for your processes instead of forcing the business into a generic product. We design around roles, data, and the workflows that actually run the company.', '', '', 'How a custom software engagement runs', '', 'Why choose custom software', 'Get a system that follows your operating model instead of the other way around.',
  'Custom software FAQs', 'Ready to scope custom software?', 'Describe the workflow that needs a better system. We will reply with a next step.', 'Start a conversation', '/contact', 'What we deliver', 'Software that fits operations without unnecessary complexity.', 'Problems we solve',
  'Friction that appears when tools and workflows drift apart.', 'Custom vs off-the-shelf', 'Off-the-shelf tools ship faster when your process already fits. Custom software is the better fit when workflows, permissions, or integrations are unique enough that configuring a product becomes a permanent compromise.', (SELECT id FROM service_pages_active WHERE slug = 'custom-development' LIMIT 1), 30, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'custom-software-development');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'custom-software-development' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Internal business systems', 'Tools for operations, approvals, and reporting tailored to your roles.', 10), ('Customer-facing platforms', 'Portals and products shaped around your users and data model.', 20), ('Integrations', 'Connect systems so teams stop copying data by hand.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'custom-software-development' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Spreadsheets holding critical process', 'We turn fragile side systems into durable workflows.', 10), ('Tools that almost fit', 'When configuration ceilings are hit, custom software removes the constant workarounds.', 20), ('Unclear ownership after launch', 'We define modules and handoff so your team can keep improving.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'custom-software-development' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Discovery', 'Map roles, workflows, data, and constraints.', 10), (2, 'Solution design', 'Define scope, modules, and integration points.', 20), (3, 'Incremental build', 'Deliver reviewable slices instead of a long black box.', 30), (4, 'Validation', 'Test with real operators and refine before broader rollout.', 40), (5, 'Handoff', 'Document operation paths and next improvements.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'custom-software-development' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Fits how you work', 'Workflows follow your teams, not a vendor template.', 10), ('Integrates cleanly', 'Connect the systems you already rely on.', 20), ('Evolves with the business', 'Add modules without starting from scratch.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'custom-software-development' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Custom software', 'Built for your process, permissions, and integrations.', 10), ('Off-the-shelf', 'Faster when your needs already match a product category.', 20), ('Hybrid approaches', 'Sometimes configure a product and custom-build only the unique pieces.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'custom-software-development' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('How do you keep scope under control?', 'We start with a first useful release and expand in planned increments.', 10), ('Will our team be able to maintain it?', 'We design for clear ownership and document how routine changes should work.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'web-app-development', 'Web App Development', 'Web Apps', 'Web Application Development | JZ Enterprises', 'Browser-based applications, portals, dashboards, and SaaS-style products engineered for modern users.', 'Web Application Development | JZ Enterprises', 'Browser-based applications, portals, dashboards, and SaaS-style products engineered for modern users.', '/images/services/software-b.jpg',
  'Web App Development', 'Web Applications Built for Real Work', 'Ship secure, usable browser apps — portals, dashboards, and products your teams and customers can rely on.', 'Discuss Your Project', '/contact', 'Back to Custom Development', '/services/custom-development', '/images/services/software-b.jpg',
  'What web app development means', 'A web application is software that runs in the browser with accounts, workflows, and data — not just a marketing site. We build apps around roles, permissions, and the jobs people must complete.', '', '', 'How a web app engagement runs', '', 'Why build a custom web app', 'Give users a durable tool for recurring work instead of stretching a brochure site.',
  'Web app FAQs', 'Ready to scope a web app?', 'Tell us who will use it and what they must accomplish.', 'Start a conversation', '/contact', 'What we deliver', 'Practical web app delivery from product shape through operable release.', 'Problems we solve',
  'Where marketing sites and real applications diverge.', 'Website vs web application', 'A website primarily informs and converts visitors. A web application lets signed-in users complete ongoing work with data, permissions, and workflows.', (SELECT id FROM service_pages_active WHERE slug = 'custom-development' LIMIT 1), 40, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'web-app-development');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-app-development' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Portals and dashboards', 'Role-aware interfaces for customers, partners, or internal teams.', 10), ('Workflow products', 'Multi-step processes with clear states and permissions.', 20), ('API-backed experiences', 'Reliable front ends connected to your services and data.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-app-development' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Brochure sites asked to behave like products', 'We separate marketing surfaces from application workflows.', 10), ('Permission confusion', 'We design roles early so sensitive actions stay controlled.', 20), ('Features without an operating model', 'We plan admin paths and supportability with the product.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-app-development' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Discovery', 'Define users, jobs, data, and constraints.', 10), (2, 'UX and information architecture', 'Shape navigation and key screens around tasks.', 20), (3, 'Build', 'Deliver increments with reviewable milestones.', 30), (4, 'Hardening', 'Cover auth, permissions, and critical path testing.', 40), (5, 'Launch and iterate', 'Ship with a backlog of sensible next improvements.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-app-development' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Built for ongoing work', 'Users can complete jobs, not only read pages.', 10), ('Clear roles', 'Permissions follow how your organization actually operates.', 20), ('Room to grow', 'Add modules without rewriting the foundation.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-app-development' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Website', 'Best for publishing, persuasion, and lead capture.', 10), ('Web application', 'Best when users need accounts, data, and recurring workflows.', 20), ('Often both', 'Many businesses need a marketing site plus a separate application.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-app-development' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Can you rebuild an existing internal tool?', 'Yes. We start by mapping current workflows and what must improve.', 10), ('Do you handle authentication and roles?', 'Yes. Access model is part of discovery and design.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'ecommerce-development', 'E-commerce Development', 'E-commerce', 'E-commerce Development | JZ Enterprises', 'Online stores and custom commerce experiences designed to make products easier to discover, purchase, and manage.', 'E-commerce Development | JZ Enterprises', 'Online stores and custom commerce experiences designed to make products easier to discover, purchase, and manage.', '/images/services/design.jpg',
  'E-commerce Development', 'E-commerce Experiences Built to Sell Clearly', 'Launch or improve an online store with product discovery, checkout clarity, and operations your team can run.', 'Discuss Your Project', '/contact', 'Back to Custom Development', '/services/custom-development', '/images/services/design.jpg',
  'What e-commerce development means', 'E-commerce development is building the storefront and commerce flows that turn browsing into orders — catalogs, carts, checkout, and the admin paths that keep inventory and fulfillment workable.', '', '', 'How an e-commerce engagement runs', '', 'Why invest in e-commerce development', 'Make buying and operating the store clearer for customers and your team.',
  'E-commerce FAQs', 'Ready to improve your store?', 'Share your catalog and checkout challenges. We will outline a next step.', 'Start a conversation', '/contact', 'What we deliver', 'Commerce work focused on clarity for shoppers and operators.', 'Problems we solve',
  'Friction that quietly kills conversion or creates ops pain.', 'Custom commerce vs packaged storefront', 'Packaged platforms move fast when your catalog and checkout fit the defaults. Custom commerce work is useful when product presentation, pricing rules, or operations need more control.', (SELECT id FROM service_pages_active WHERE slug = 'custom-development' LIMIT 1), 50, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'ecommerce-development');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-development' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Storefronts and catalogs', 'Clear product pages, collections, and navigation shoppers can understand.', 10), ('Checkout clarity', 'Reduce friction in cart and payment flows without inventing conversion claims.', 20), ('Ops-friendly admin paths', 'Help your team manage products, orders, and content cleanly.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-development' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Products that are hard to find', 'We improve structure and filtering around how people shop.', 10), ('Checkout drop-off from confusion', 'We simplify steps and messaging around what happens next.', 20), ('Stores that fight operations', 'We align front-end flows with how your team actually fulfills.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-development' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Discovery', 'Review catalog, audiences, and operational constraints.', 10), (2, 'Experience design', 'Shape browse, product, and checkout journeys.', 20), (3, 'Build', 'Implement storefront and integrations in focused slices.', 30), (4, 'QA', 'Validate critical purchase paths before launch.', 40), (5, 'Launch support', 'Ship with a checklist your team can operate.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-development' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Clearer buying path', 'Shoppers understand products and next steps.', 10), ('Better ops fit', 'Store flows match how you fulfill and support.', 20), ('Room to extend', 'Add features without rebuilding the whole store.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-development' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Packaged storefront', 'Strong default when your needs match the platform.', 10), ('Custom commerce work', 'Useful for unique catalogs, pricing, or experience requirements.', 20), ('Practical hybrid', 'Often configure a platform and custom-build only the differentiators.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-development' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you migrate existing stores?', 'Yes, when migration is in scope. We plan content, redirects, and cutover carefully.', 10), ('Can you work with our current platform?', 'Often yes. We confirm fit during discovery.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'technical-seo', 'Technical SEO', 'Technical SEO', 'Technical SEO Services | JZ Enterprises', 'Crawlability, indexation, site structure, and performance fundamentals that help search engines understand your site.', 'Technical SEO Services | JZ Enterprises', 'Crawlability, indexation, site structure, and performance fundamentals that help search engines understand your site.', '/images/services/seo.jpg',
  'Technical SEO', 'Technical SEO That Makes Sites Easier to Understand', 'Fix crawl, index, and structure issues so search engines can find and interpret your important pages.', 'Discuss Your Project', '/contact', 'Back to SEO', '/services/seo', '/images/services/seo.jpg',
  'What technical SEO means', 'Technical SEO is the foundation work that helps search engines crawl, render, and understand your site — structure, indexation signals, and performance basics.', '', '', 'How a technical SEO engagement runs', '', 'Why technical SEO matters', 'Clear foundations make content and marketing work harder for you.',
  'Technical SEO FAQs', 'Want a technical SEO review?', 'Share your site and priorities. We will propose a focused plan.', 'Start a conversation', '/contact', 'What we deliver', 'Foundational site health work without ranking promises.', 'Problems we solve',
  'Technical blockers that keep good content from being discovered.', 'Technical SEO vs on-page SEO', 'Technical SEO makes the site crawlable and understandable. On-page SEO shapes the content and page-level signals people and search engines read on each URL.', (SELECT id FROM service_pages_active WHERE slug = 'seo' LIMIT 1), 10, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'technical-seo');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'technical-seo' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Crawl and indexation reviews', 'Find blockers that hide important pages from discovery.', 10), ('Structure and internal pathways', 'Clarify how key sections connect so important URLs are easier to reach.', 20), ('Performance basics', 'Improve page weight and responsiveness that affect usability and crawl efficiency.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'technical-seo' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Important pages never get found', 'We diagnose crawl and index issues first.', 10), ('Confusing site structure', 'We simplify pathways so key URLs are clearer.', 20), ('Technical debt after redesigns', 'We catch regressions that quietly break discovery.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'technical-seo' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Audit', 'Review crawl, index, structure, and critical templates.', 10), (2, 'Prioritize', 'Rank fixes by impact and effort for your stack.', 20), (3, 'Implement', 'Ship changes with clear ownership.', 30), (4, 'Validate', 'Confirm fixes with follow-up checks.', 40), (5, 'Maintain', 'Leave a practical checklist for ongoing health.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'technical-seo' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Clearer discovery foundations', 'Search systems can reach your important pages.', 10), ('Less wasted content effort', 'Publishing is not blocked by invisible technical issues.', 20), ('Better redesign safety', 'Changes are checked for crawl and index regressions.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'technical-seo' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Technical SEO', 'Crawl, index, structure, and site health foundations.', 10), ('On-page SEO', 'Titles, content clarity, and page-level relevance signals.', 20), ('They work together', 'Strong pages still need a site that can be crawled and understood.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'technical-seo' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you guarantee rankings?', 'No. We improve foundations and clarity; rankings depend on many factors.', 10), ('Can you work with our developers?', 'Yes. We provide prioritized fixes your team can implement.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'international-seo', 'International SEO', 'International SEO', 'International SEO Services | JZ Enterprises', 'Multi-region and multi-language SEO structure so the right audiences find the right version of your site.', 'International SEO Services | JZ Enterprises', 'Multi-region and multi-language SEO structure so the right audiences find the right version of your site.', '/images/services/seo-b.jpg',
  'International SEO', 'International SEO for Multi-Market Sites', 'Organize language and region versions so customers land on the right experience.', 'Discuss Your Project', '/contact', 'Back to SEO', '/services/seo', '/images/services/seo-b.jpg',
  'What international SEO means', 'International SEO is how you structure and signal multi-language or multi-region sites so people and search engines can choose the correct version.', '', '', 'How an international SEO engagement runs', '', 'Why international structure matters', 'Help each market find the right pages without fighting duplicates.',
  'International SEO FAQs', 'Expanding into more markets?', 'Tell us which countries and languages matter. We will outline structure options.', 'Start a conversation', '/contact', 'What we deliver', 'Structure and clarity for markets you actually serve.', 'Problems we solve',
  'Confusion that appears when markets share one messy site.', 'Country sites vs language sites', 'Country targeting serves location-specific needs. Language targeting serves shared languages across regions. Many organizations need a clear mix of both.', (SELECT id FROM service_pages_active WHERE slug = 'seo' LIMIT 1), 20, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'international-seo');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'international-seo' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Market and language architecture', 'Choose URL and content patterns that match how you sell.', 10), ('Hreflang and version clarity', 'Reduce duplicate confusion across related pages.', 20), ('Localized content planning', 'Prioritize pages that matter per market without copying everything blindly.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'international-seo' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Wrong-language landings', 'We clarify version signals and navigation.', 10), ('Duplicate content across markets', 'We define which pages are unique vs shared.', 20), ('Expansion without a blueprint', 'We set a structure before new markets multiply the mess.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'international-seo' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Market map', 'List countries, languages, and priority offers.', 10), (2, 'Architecture', 'Recommend URL and content patterns.', 20), (3, 'Implementation plan', 'Sequence technical and content work.', 30), (4, 'Rollout', 'Ship changes market by market where needed.', 40), (5, 'Review', 'Check that versions resolve cleanly.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'international-seo' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Right page, right audience', 'Markets reach the correct experience.', 10), ('Cleaner expansion', 'New regions follow a known pattern.', 20), ('Less duplicate noise', 'Related versions are intentional.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'international-seo' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Country-oriented structure', 'Best when offers, currency, or compliance differ by place.', 10), ('Language-oriented structure', 'Best when language is the main difference across regions.', 20), ('Combined models', 'Common when you serve both regional and language needs.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'international-seo' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do we need a separate site per country?', 'Not always. Architecture depends on offers, languages, and operations.', 10), ('Can you help with translation strategy?', 'We help decide what must be localized versus shared.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'local-seo', 'Local SEO', 'Local SEO', 'Local SEO Services | JZ Enterprises', 'Local presence work for businesses that need to be found by nearby customers searching for services.', 'Local SEO Services | JZ Enterprises', 'Local presence work for businesses that need to be found by nearby customers searching for services.', '/images/services/seo-c.jpg',
  'Local SEO', 'Local SEO for Customers Near You', 'Strengthen local visibility with accurate business information, location pages, and useful local content.', 'Discuss Your Project', '/contact', 'Back to SEO', '/services/seo', '/images/services/seo-c.jpg',
  'What local SEO means', 'Local SEO helps nearby customers find your business in search and maps. It focuses on accurate entity information, location relevance, and pages that answer local intent.', '', '', 'How a local SEO engagement runs', '', 'Why local SEO matters', 'Make it easier for nearby buyers to choose you with confidence.',
  'Local SEO FAQs', 'Need stronger local discovery?', 'Share your locations and services. We will propose a focused plan.', 'Start a conversation', '/contact', 'What we deliver', 'Practical local presence work without ranking guarantees.', 'Problems we solve',
  'Why nearby customers still cannot find you.', 'Local SEO vs national SEO', 'Local SEO prioritizes nearby discovery and location accuracy. Broader SEO targets topics and markets beyond a single service area.', (SELECT id FROM service_pages_active WHERE slug = 'seo' LIMIT 1), 30, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'local-seo');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'local-seo' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Business profile accuracy', 'Keep name, address, hours, and categories consistent.', 10), ('Location pages that help', 'Create clear pages for real service areas and offers.', 20), ('Review and citation hygiene', 'Reduce confusing or conflicting public information.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'local-seo' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Inconsistent NAP details', 'We align public information so customers trust what they see.', 10), ('Thin location pages', 'We improve usefulness instead of spinning empty city copies.', 20), ('Multi-location confusion', 'We clarify which pages and profiles represent each place.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'local-seo' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Inventory', 'Review locations, profiles, and current pages.', 10), (2, 'Cleanup', 'Fix inaccurate or conflicting information.', 20), (3, 'Page plan', 'Prioritize useful location and service pages.', 30), (4, 'Implement', 'Ship updates with clear ownership.', 40), (5, 'Maintain', 'Leave a checklist for ongoing accuracy.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'local-seo' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Clearer local presence', 'Customers find accurate information.', 10), ('Better service-area coverage', 'Pages match where you actually operate.', 20), ('Less profile drift', 'Public details stay consistent over time.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'local-seo' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Local SEO', 'Nearby discovery, maps presence, and location relevance.', 10), ('Broader SEO', 'Topic and market visibility beyond a single area.', 20), ('Many businesses need both', 'Local pages plus stronger category content.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'local-seo' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you guarantee map pack rankings?', 'No. We improve accuracy and usefulness; placement varies.', 10), ('Can you support multiple locations?', 'Yes. We plan structure and ownership per location.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'ecommerce-seo', 'E-commerce SEO', 'E-commerce SEO', 'E-commerce SEO Services | JZ Enterprises', 'SEO for product and category discovery — cleaner architecture, indexation, and useful merchandising pages.', 'E-commerce SEO Services | JZ Enterprises', 'SEO for product and category discovery — cleaner architecture, indexation, and useful merchandising pages.', '/images/services/seo.jpg',
  'E-commerce SEO', 'E-commerce SEO for Product Discovery', 'Help shoppers and search engines understand your categories and products without thin or duplicated pages.', 'Discuss Your Project', '/contact', 'Back to SEO', '/services/seo', '/images/services/seo.jpg',
  'What e-commerce SEO means', 'E-commerce SEO improves how product and category pages are structured, indexed, and understood so people can find the right items.', '', '', 'How an e-commerce SEO engagement runs', '', 'Why e-commerce SEO matters', 'Make your catalog easier to discover and understand.',
  'E-commerce SEO FAQs', 'Want clearer product discovery?', 'Share your store URL and catalog challenges.', 'Start a conversation', '/contact', 'What we deliver', 'Catalog-aware SEO foundations for stores.', 'Problems we solve',
  'Common store issues that hide products or create duplicate noise.', 'Category SEO vs product SEO', 'Category pages help shoppers browse collections. Product pages need unique, useful detail. Healthy stores treat both as complementary, not copies of each other.', (SELECT id FROM service_pages_active WHERE slug = 'seo' LIMIT 1), 40, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'ecommerce-seo');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-seo' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Category architecture', 'Clarify collections so browsing and indexing stay sane.', 10), ('Product page usefulness', 'Improve unique detail that helps buyers decide.', 20), ('Indexation control', 'Reduce noise from filters, variants, and thin templates.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-seo' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Endless thin variants', 'We control what should be indexed versus consolidated.', 10), ('Categories that do not help shoppers', 'We improve structure and on-page clarity.', 20), ('Duplicate templates across the catalog', 'We prioritize unique value where it matters.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-seo' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Catalog review', 'Assess templates, faceting, and index patterns.', 10), (2, 'Priority map', 'Choose high-value categories and products first.', 20), (3, 'Fixes', 'Implement architecture and template improvements.', 30), (4, 'Content support', 'Upgrade key pages with useful detail.', 40), (5, 'Monitor', 'Check indexation and template health over time.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-seo' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Cleaner catalog discovery', 'Important pages are easier to find.', 10), ('Less index noise', 'Thin or duplicate URLs are controlled.', 20), ('Better merchandising clarity', 'Categories explain what shoppers will find.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-seo' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Category focus', 'Helps collection browsing and topical coverage.', 10), ('Product focus', 'Helps individual item understanding and conversion clarity.', 20), ('Both matter', 'Stores need healthy templates at each level.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ecommerce-seo' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you rewrite every product page?', 'No. We prioritize templates and high-value pages first.', 10), ('Can you work with our platform constraints?', 'Yes. Recommendations respect what your stack can change.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'geo-aeo', 'GEO & AEO', 'GEO & AEO', 'GEO and AEO Services | JZ Enterprises', 'Generative and answer-engine oriented content work that makes your expertise easier to understand and cite.', 'GEO and AEO Services | JZ Enterprises', 'Generative and answer-engine oriented content work that makes your expertise easier to understand and cite.', '/images/services/seo-b.jpg',
  'GEO & AEO', 'GEO and AEO Content That Clarifies Your Expertise', 'Make your answers clearer for people, search pages, and answer-style experiences — without hype or guaranteed placements.', 'Discuss Your Project', '/contact', 'Back to SEO', '/services/seo', '/images/services/seo-b.jpg',
  'What GEO and AEO mean', 'GEO and AEO focus on making your expertise easy to understand, quote, and trust in generative and answer-oriented experiences. The work still starts with accurate, well-structured content for humans.', '', '', 'How a GEO/AEO engagement runs', '', 'Why this work matters', 'Help people and systems represent your expertise accurately.',
  'GEO and AEO FAQs', 'Want clearer answer-ready content?', 'Share the topics you need to own. We will propose a practical plan.', 'Start a conversation', '/contact', 'What we deliver', 'Clarity-first content and structure for modern discovery.', 'Problems we solve',
  'Why good expertise still gets ignored or misrepresented.', 'SEO vs AEO vs GEO', 'SEO improves discovery in search results. AEO emphasizes clear answers for question-led experiences. GEO focuses on how generative systems summarize and attribute expertise. They overlap, and strong fundamentals help all three.', (SELECT id FROM service_pages_active WHERE slug = 'seo' LIMIT 1), 50, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'geo-aeo');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'geo-aeo' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Answer-ready page structure', 'Organize content so questions get clear, complete responses.', 10), ('Entity and expertise clarity', 'Make who you are and what you know easier to understand.', 20), ('Content that cites cleanly', 'Write durable explanations people and systems can summarize accurately.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'geo-aeo' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Expertise buried in fluff', 'We rewrite for direct answers without losing depth.', 10), ('Pages that never resolve the question', 'We restructure content around real questions buyers ask.', 20), ('Brand misrepresentation risk', 'Clear source pages reduce vague third-party summaries.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'geo-aeo' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Topic map', 'Identify questions and claims you must own.', 10), (2, 'Gap review', 'Find weak or missing answer pages.', 20), (3, 'Rewrite and structure', 'Ship clearer pages and sections.', 30), (4, 'Support assets', 'Add FAQs and definitions where useful.', 40), (5, 'Review cadence', 'Keep high-value answers current.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'geo-aeo' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Clearer expertise', 'Your answers are easier to understand and reuse.', 10), ('Stronger fundamentals', 'Work still helps classic search discovery.', 20), ('Less ambiguity', 'Important claims are stated plainly on your site.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'geo-aeo' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('SEO', 'Helps people discover relevant pages through search.', 10), ('AEO', 'Emphasizes clear answers for question-led experiences.', 20), ('GEO', 'Focuses on how generative systems summarize and attribute expertise.', 30), ('Shared foundation', 'Accurate structure and useful content support all three.', 40)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'geo-aeo' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Is this separate from SEO?', 'It overlaps. We strengthen clarity and structure that help multiple discovery surfaces.', 10), ('Do you promise citations in AI answers?', 'No. We improve source clarity; third-party systems choose what to show.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'ppc-management', 'PPC Management', 'PPC', 'PPC Management Services | JZ Enterprises', 'Paid search and paid social campaign structure focused on clear offers, tracking, and accountable optimization.', 'PPC Management Services | JZ Enterprises', 'Paid search and paid social campaign structure focused on clear offers, tracking, and accountable optimization.', '/images/services/smm.jpg',
  'PPC Management', 'PPC Management With Clear Offers and Tracking', 'Plan and improve paid campaigns around real landing pages and measurable actions — without invented return claims.', 'Discuss Your Project', '/contact', 'Back to Digital Marketing', '/services/digital-marketing', '/images/services/smm.jpg',
  'What PPC management means', 'PPC management is the ongoing work of structuring, launching, and improving paid campaigns so spend supports clear offers and tracked outcomes.', '', '', 'How a PPC engagement runs', '', 'Why structured PPC matters', 'Know what you are buying and why before scaling spend.',
  'PPC FAQs', 'Want clearer paid campaigns?', 'Share your offers and current accounts. We will outline a next step.', 'Start a conversation', '/contact', 'What we deliver', 'Accountable paid media work grounded in offer clarity.', 'Problems we solve',
  'Why paid spend often feels busy but unclear.', 'Search ads vs social ads', 'Search ads capture existing intent. Social ads create demand and reach audiences who may not be searching yet. Many programs use both with different jobs.', (SELECT id FROM service_pages_active WHERE slug = 'digital-marketing' LIMIT 1), 10, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'ppc-management');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ppc-management' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Campaign architecture', 'Organize campaigns around offers and audiences, not random ad sets.', 10), ('Landing page alignment', 'Match ads to pages that actually explain the offer.', 20), ('Measurement basics', 'Confirm conversion tracking before aggressive scaling.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ppc-management' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Spend without a clear goal', 'We define actions that matter before optimizing bids.', 10), ('Ads that overpromise the page', 'We align messaging between ads and landings.', 20), ('Messy accounts', 'We restructure for clarity and reviewability.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ppc-management' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Offer and goal review', 'Confirm what success means for paid traffic.', 10), (2, 'Account structure', 'Build or clean campaigns around those goals.', 20), (3, 'Launch', 'Ship with tracking checks in place.', 30), (4, 'Optimize', 'Improve based on observed performance, not guesses.', 40), (5, 'Report', 'Explain what changed and why in plain language.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ppc-management' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Clearer intent', 'Campaigns map to real offers.', 10), ('Better learning loops', 'Tracking supports honest decisions.', 20), ('Controlled growth', 'Scale only when foundations are sound.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ppc-management' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Search ads', 'Strong when people already look for your category.', 10), ('Social ads', 'Useful for reach, remarketing, and demand creation.', 20), ('Shared requirement', 'Both need clear offers and trustworthy landing pages.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ppc-management' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you guarantee a specific return?', 'No. We improve structure, tracking, and offer alignment.', 10), ('Can you manage existing accounts?', 'Yes, after a cleanup and goal review.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'social-media-marketing', 'Social Media Marketing', 'Social Media', 'Social Media Marketing | JZ Enterprises', 'Social content and campaign support that clarifies your brand voice and turns attention into useful next steps.', 'Social Media Marketing | JZ Enterprises', 'Social content and campaign support that clarifies your brand voice and turns attention into useful next steps.', '/images/services/smm-b.jpg',
  'Social Media Marketing', 'Social Media Marketing With a Clear Point of View', 'Publish and promote content that sounds like your brand and leads somewhere useful — not empty engagement theater.', 'Discuss Your Project', '/contact', 'Back to Digital Marketing', '/services/digital-marketing', '/images/services/smm-b.jpg',
  'What social media marketing means', 'Social media marketing is how you show up on social platforms with a consistent voice, useful posts, and campaigns that support real business goals.', '', '', 'How a social engagement runs', '', 'Why invest in social marketing', 'Meet audiences where they already spend attention — with purpose.',
  'Social media FAQs', 'Need a clearer social plan?', 'Tell us your brand voice and goals. We will propose a focused approach.', 'Start a conversation', '/contact', 'What we deliver', 'Practical social work tied to offers and brand clarity.', 'Problems we solve',
  'Why social activity often feels busy but disconnected.', 'Organic social vs paid social', 'Organic social builds presence and relationships over time. Paid social extends reach for specific offers. Most brands need a mix with clear jobs for each.', (SELECT id FROM service_pages_active WHERE slug = 'digital-marketing' LIMIT 1), 20, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'social-media-marketing');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'social-media-marketing' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Content systems', 'Plan themes and formats your team can sustain.', 10), ('Campaign support', 'Promote offers with creative that matches the landing experience.', 20), ('Brand voice consistency', 'Keep posts recognizable across channels.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'social-media-marketing' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Posting without a destination', 'We connect content to useful next steps.', 10), ('Inconsistent voice', 'We define tone and examples teams can follow.', 20), ('Channel sprawl', 'We prioritize platforms that match your audience.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'social-media-marketing' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Audience and offer review', 'Clarify who you speak to and why.', 10), (2, 'Channel plan', 'Choose platforms and content pillars.', 20), (3, 'Produce', 'Create posts and assets in sustainable batches.', 30), (4, 'Publish and promote', 'Ship organic and paid support as needed.', 40), (5, 'Review', 'Learn what resonated and refine.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'social-media-marketing' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Recognizable presence', 'Your brand sounds consistent.', 10), ('Useful attention', 'Content points to real next steps.', 20), ('Sustainable cadence', 'Systems your team can keep running.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'social-media-marketing' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Organic social', 'Best for ongoing presence and relationship building.', 10), ('Paid social', 'Best for controlled reach behind a specific offer.', 20), ('Combined programs', 'Use organic for voice and paid for amplification.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'social-media-marketing' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you post every day?', 'Cadence depends on goals and capacity. We recommend a sustainable plan.', 10), ('Can you work with our in-house team?', 'Yes. We can lead, support, or advise.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'content-marketing', 'Content Marketing', 'Content', 'Content Marketing Services | JZ Enterprises', 'Useful articles, guides, and assets that explain your expertise and support discovery and sales conversations.', 'Content Marketing Services | JZ Enterprises', 'Useful articles, guides, and assets that explain your expertise and support discovery and sales conversations.', '/images/services/smm-c.jpg',
  'Content Marketing', 'Content Marketing That Answers Real Questions', 'Create durable content that educates buyers and supports search and sales — without fluff.', 'Discuss Your Project', '/contact', 'Back to Digital Marketing', '/services/digital-marketing', '/images/services/smm-c.jpg',
  'What content marketing means', 'Content marketing is publishing useful material that helps people understand a problem and your approach, then take a sensible next step.', '', '', 'How a content engagement runs', '', 'Why content marketing matters', 'Give buyers answers they can trust before they talk to sales.',
  'Content marketing FAQs', 'Need a clearer content plan?', 'Share your audience and topics. We will outline priorities.', 'Start a conversation', '/contact', 'What we deliver', 'Editorial work grounded in buyer questions and clear expertise.', 'Problems we solve',
  'Why publishing volume often fails to help sales or discovery.', 'Thought leadership vs demand content', 'Thought leadership builds credibility and point of view. Demand content helps people evaluate offers and take action. Strong programs usually need both.', (SELECT id FROM service_pages_active WHERE slug = 'digital-marketing' LIMIT 1), 30, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'content-marketing');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'content-marketing' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Topic and question maps', 'Prioritize what buyers actually need explained.', 10), ('Durable articles and guides', 'Write pieces that stay useful beyond a news cycle.', 20), ('Offer-aware CTAs', 'Point readers to sensible next steps without hard-sell noise.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'content-marketing' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Content nobody can find a use for', 'We start from questions and jobs to be done.', 10), ('Inconsistent expertise', 'We define a point of view your team can maintain.', 20), ('Publishing without distribution', 'We plan how content gets discovered and reused.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'content-marketing' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Audience questions', 'Collect the questions sales and search already surface.', 10), (2, 'Editorial plan', 'Sequence topics by priority.', 20), (3, 'Produce', 'Write and design assets with clear ownership.', 30), (4, 'Publish', 'Ship with metadata and pathways that help readers continue.', 40), (5, 'Refresh', 'Update winners instead of only adding volume.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'content-marketing' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Buyer education', 'Prospects understand you before the call.', 10), ('Reusable assets', 'Sales and social can share the same explanations.', 20), ('Compounding value', 'Strong pieces keep working over time.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'content-marketing' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Thought leadership', 'Builds credibility and a distinct point of view.', 10), ('Demand content', 'Helps people evaluate offers and act.', 20), ('Best together', 'Credibility plus clear next steps.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'content-marketing' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you only write blog posts?', 'No. Guides, pages, and other formats are in scope when useful.', 10), ('Can you use our subject-matter experts?', 'Yes. Interviews and reviews are part of quality content.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'email-marketing', 'Email Marketing', 'Email', 'Email Marketing Services | JZ Enterprises', 'Lifecycle and campaign email that keeps customers informed with useful messages and clear calls to action.', 'Email Marketing Services | JZ Enterprises', 'Lifecycle and campaign email that keeps customers informed with useful messages and clear calls to action.', '/images/services/smm.jpg',
  'Email Marketing', 'Email Marketing That Respects the Inbox', 'Design journeys and campaigns people actually want to open — clear, useful, and easy to act on.', 'Discuss Your Project', '/contact', 'Back to Digital Marketing', '/services/digital-marketing', '/images/services/smm.jpg',
  'What email marketing means', 'Email marketing is how you communicate with people who already gave you permission — welcome flows, updates, and campaigns that support retention and conversion.', '', '', 'How an email engagement runs', '', 'Why email still matters', 'Talk directly to people who already opted in.',
  'Email marketing FAQs', 'Want better email journeys?', 'Share your list and goals. We will propose a practical plan.', 'Start a conversation', '/contact', 'What we deliver', 'Practical lifecycle and campaign work with clear messaging.', 'Problems we solve',
  'Why email lists often underperform despite volume.', 'Lifecycle email vs blast campaigns', 'Lifecycle email responds to user actions over time. Blast campaigns announce something to a segment at a moment in time. Healthy programs use both deliberately.', (SELECT id FROM service_pages_active WHERE slug = 'digital-marketing' LIMIT 1), 40, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'email-marketing');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'email-marketing' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Lifecycle flows', 'Welcome, onboarding, and nurture sequences with clear jobs.', 10), ('Campaign planning', 'Announcements and offers with sensible segments.', 20), ('Template systems', 'Reusable layouts your team can keep shipping.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'email-marketing' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('One generic newsletter for everyone', 'We segment by interest and stage where data allows.', 10), ('Emails with no clear action', 'We tighten messaging and next steps.', 20), ('Broken journeys after signup', 'We map flows from first opt-in onward.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'email-marketing' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Audit', 'Review list health, templates, and existing flows.', 10), (2, 'Journey map', 'Define the messages each stage needs.', 20), (3, 'Build', 'Implement templates and automations.', 30), (4, 'Test', 'Check rendering, links, and tracking.', 40), (5, 'Iterate', 'Improve based on engagement and feedback.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'email-marketing' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Direct access', 'Reach people who opted in.', 10), ('Repeatable systems', 'Flows keep working between campaigns.', 20), ('Clearer offers', 'Messages explain what to do next.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'email-marketing' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Lifecycle email', 'Triggered by behavior or stage.', 10), ('Campaign blasts', 'Scheduled messages to chosen segments.', 20), ('Combined programs', 'Use journeys for continuity and campaigns for moments.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'email-marketing' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you guarantee open rates?', 'No. We improve relevance, clarity, and structure.', 10), ('Can you work inside our ESP?', 'Often yes. We confirm platform fit during discovery.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'conversion-optimization', 'Conversion Optimization', 'Conversion', 'Conversion Optimization | JZ Enterprises', 'Improve page clarity, forms, and funnels so more visitors take the next useful step.', 'Conversion Optimization | JZ Enterprises', 'Improve page clarity, forms, and funnels so more visitors take the next useful step.', '/images/services/smm-b.jpg',
  'Conversion Optimization', 'Conversion Optimization Focused on Clarity', 'Find friction in key pages and funnels, then improve messaging, layout, and forms so next steps are obvious.', 'Discuss Your Project', '/contact', 'Back to Digital Marketing', '/services/digital-marketing', '/images/services/smm-b.jpg',
  'What conversion optimization means', 'Conversion optimization is the practice of improving pages and flows so a higher share of visitors complete a meaningful action — without inventing performance guarantees.', '', '', 'How a CRO engagement runs', '', 'Why conversion optimization matters', 'Get more value from the traffic and content you already have.',
  'Conversion optimization FAQs', 'Want fewer drop-offs on key pages?', 'Share your top URLs and goals. We will propose a plan.', 'Start a conversation', '/contact', 'What we deliver', 'Practical experimentation and UX clarity on high-value pages.', 'Problems we solve',
  'Why traffic often fails to turn into leads or sales.', 'CRO vs redesign', 'CRO improves specific friction with focused changes and tests. A redesign rebuilds broader experience and brand presentation. Choose based on whether the foundation is sound.', (SELECT id FROM service_pages_active WHERE slug = 'digital-marketing' LIMIT 1), 50, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'conversion-optimization');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'conversion-optimization' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Funnel and page reviews', 'Identify unclear offers, weak proof, and form friction.', 10), ('Hypothesis-driven changes', 'Ship focused improvements you can learn from.', 20), ('Measurement alignment', 'Confirm events match the actions that matter.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'conversion-optimization' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Pretty pages that do not convert', 'We clarify offer, proof, and next step.', 10), ('Forms that ask too much too soon', 'We reduce unnecessary fields and anxiety.', 20), ('Traffic growth without revenue growth', 'We prioritize pages closest to revenue actions.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'conversion-optimization' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Baseline', 'Review analytics, pages, and qualitative feedback.', 10), (2, 'Hypotheses', 'Prioritize changes with clear expected impact.', 20), (3, 'Implement', 'Ship improvements or tests.', 30), (4, 'Learn', 'Read results honestly, including inconclusive ones.', 40), (5, 'Compound', 'Keep a backlog of the next highest-value fixes.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'conversion-optimization' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Clearer pages', 'Visitors understand what to do.', 10), ('Better use of traffic', 'Improvements compound on existing visits.', 20), ('Learning culture', 'Decisions follow evidence, not opinions alone.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'conversion-optimization' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('CRO', 'Focused friction fixes and experiments.', 10), ('Full redesign', 'Broader visual and structural rebuild.', 20), ('When to choose which', 'CRO first if the offer is clear; redesign if the experience is fundamentally outdated.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'conversion-optimization' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you promise a conversion lift?', 'No. We reduce friction and improve clarity; results vary.', 10), ('Do we need lots of traffic to start?', 'Helpful, but qualitative reviews still uncover major issues on smaller sites.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'ui-ux-design', 'UI/UX Design', 'UI/UX', 'UI/UX Design Services | JZ Enterprises', 'Interface and experience design that makes products clearer, faster to learn, and easier to use.', 'UI/UX Design Services | JZ Enterprises', 'Interface and experience design that makes products clearer, faster to learn, and easier to use.', '/images/services/design.jpg',
  'UI/UX Design', 'UI/UX Design for Clearer Product Experiences', 'Design flows and interfaces around real tasks so products feel understandable from the first session.', 'Discuss Your Project', '/contact', 'Back to Design', '/services/design', '/images/services/design.jpg',
  'What UI/UX design means', 'UI/UX design shapes how people understand and use a product — information architecture, interaction, and visual interface working together.', '', '', 'How a UI/UX engagement runs', '', 'Why invest in UI/UX', 'Reduce confusion and support costs by designing for real tasks.',
  'UI/UX FAQs', 'Need clearer product UX?', 'Share the product and the friction you see. We will outline a next step.', 'Start a conversation', '/contact', 'What we deliver', 'Practical product design from research through handoff.', 'Problems we solve',
  'Why products feel confusing even when features exist.', 'UX research vs UI polish', 'UX research clarifies jobs, friction, and structure. UI polish refines visual and interaction detail. Strong products need both in the right order.', (SELECT id FROM service_pages_active WHERE slug = 'design' LIMIT 1), 10, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'ui-ux-design');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ui-ux-design' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Flow and IA design', 'Map navigation and tasks before visual polish.', 10), ('Wireframes and prototypes', 'Validate key journeys early.', 20), ('UI systems', 'Create reusable components teams can ship consistently.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ui-ux-design' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Feature-heavy products that confuse users', 'We redesign around primary jobs.', 10), ('Inconsistent screens', 'We establish patterns and components.', 20), ('Handoffs that stall engineering', 'We deliver specs developers can implement.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ui-ux-design' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Discover', 'Interview stakeholders and review existing usage.', 10), (2, 'Structure', 'Define IA and critical flows.', 20), (3, 'Design', 'Prototype and refine interfaces.', 30), (4, 'Validate', 'Test with users or operators where possible.', 40), (5, 'Handoff', 'Provide assets and notes for build.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ui-ux-design' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Faster comprehension', 'Users understand what to do sooner.', 10), ('Fewer dead ends', 'Flows match real tasks.', 20), ('Cleaner delivery', 'Engineering gets clearer targets.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ui-ux-design' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('UX-first work', 'Clarifies structure and task success.', 10), ('UI polish', 'Improves visual clarity and interaction detail.', 20), ('Sequence matters', 'Solve structure before decorating screens.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'ui-ux-design' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you work with existing products?', 'Yes. Most engagements improve what already ships.', 10), ('Can you design for web and mobile?', 'Yes, with patterns suited to each surface.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'web-design', 'Web Design', 'Web Design', 'Web Design Services | JZ Enterprises', 'Marketing and product site design focused on clarity, hierarchy, and conversion-minded layouts.', 'Web Design Services | JZ Enterprises', 'Marketing and product site design focused on clarity, hierarchy, and conversion-minded layouts.', '/images/services/design-b.jpg',
  'Web Design', 'Web Design That Makes Offers Obvious', 'Design site layouts that communicate what you do, why it matters, and what to do next.', 'Discuss Your Project', '/contact', 'Back to Design', '/services/design', '/images/services/design-b.jpg',
  'What web design means', 'Web design is the visual and structural design of site pages — hierarchy, layout, and components that help visitors understand and act.', '', '', 'How a web design engagement runs', '', 'Why custom web design matters', 'Present your offer with hierarchy that matches how buyers decide.',
  'Web design FAQs', 'Ready to redesign key pages?', 'Share your current site and goals. We will propose a scoped plan.', 'Start a conversation', '/contact', 'What we deliver', 'Site design that supports content and conversion clarity.', 'Problems we solve',
  'Common website design issues that hide the offer.', 'Marketing site design vs product UI', 'Marketing site design persuades and explains. Product UI helps signed-in users complete work. Both need clarity, but success metrics differ.', (SELECT id FROM service_pages_active WHERE slug = 'design' LIMIT 1), 20, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'web-design');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-design' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Page hierarchy and layout', 'Make offers, proof, and CTAs easy to scan.', 10), ('Design systems for sites', 'Reusable sections your team can extend.', 20), ('Responsive design', 'Layouts that stay clear on phones and desktops.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-design' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Beautiful but unclear homepages', 'We rewrite visual hierarchy around the offer.', 10), ('Template look with no personality', 'We design distinctive systems still easy to maintain.', 20), ('Pages that fight the content', 'We design around real copy, not placeholder latin.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-design' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Content and goal review', 'Understand offers and audiences first.', 10), (2, 'Structure', 'Define page types and section patterns.', 20), (3, 'Visual design', 'Create layouts and components.', 30), (4, 'Review', 'Iterate with stakeholders on real content.', 40), (5, 'Handoff', 'Prepare assets for development.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-design' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Clearer first impression', 'Visitors understand you faster.', 10), ('Consistent pages', 'New pages follow the same system.', 20), ('Better build readiness', 'Design maps cleanly to development.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-design' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Marketing web design', 'Persuasion, explanation, and lead capture.', 10), ('Product UI design', 'Task completion inside an application.', 20), ('Often both', 'Many companies need a site and a product interface.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-design' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you write copy too?', 'We can collaborate on structure and messaging; full copy can be in scope when agreed.', 10), ('Can you design within our brand?', 'Yes. We work from your identity system or help refine it.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'graphic-design', 'Graphic Design', 'Graphic Design', 'Graphic Design Services | JZ Enterprises', 'Campaign visuals, presentations, and marketing graphics that stay on-brand and easy to understand.', 'Graphic Design Services | JZ Enterprises', 'Campaign visuals, presentations, and marketing graphics that stay on-brand and easy to understand.', '/images/services/design-c.jpg',
  'Graphic Design', 'Graphic Design for Clear Marketing Assets', 'Create visuals that support campaigns, sales, and social without clutter or off-brand noise.', 'Discuss Your Project', '/contact', 'Back to Design', '/services/design', '/images/services/design-c.jpg',
  'What graphic design means here', 'Graphic design produces the visual assets your marketing and sales teams use — layouts, imagery treatments, and compositions that communicate quickly.', '', '', 'How a graphic design engagement runs', '', 'Why professional graphic design helps', 'Make every asset clearer and more consistent.',
  'Graphic design FAQs', 'Need campaign or sales visuals?', 'Share the channel and message. We will propose formats and next steps.', 'Start a conversation', '/contact', 'What we deliver', 'On-brand assets for campaigns and everyday communication.', 'Problems we solve',
  'Why visual work often looks inconsistent across channels.', 'Campaign graphics vs brand systems', 'Campaign graphics solve a moment. Brand systems define reusable rules. Good programs use the system so each campaign still feels like the same company.', (SELECT id FROM service_pages_active WHERE slug = 'design' LIMIT 1), 30, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'graphic-design');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'graphic-design' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Campaign creative', 'Ads, banners, and social sets with a clear message.', 10), ('Sales and deck support', 'Layouts that help presenters stay on story.', 20), ('Template kits', 'Reusable files your team can adapt.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'graphic-design' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Every channel looks different', 'We align assets to one visual system.', 10), ('Cluttered creatives', 'We simplify hierarchy so the message lands.', 20), ('Last-minute one-offs', 'We build templates that speed future requests.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'graphic-design' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Brief', 'Confirm audience, message, and formats.', 10), (2, 'Concepts', 'Explore directions quickly.', 20), (3, 'Produce', 'Finalize assets for each channel.', 30), (4, 'Package', 'Deliver files and usage notes.', 40), (5, 'Iterate', 'Adjust based on real campaign needs.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'graphic-design' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Faster comprehension', 'Visuals communicate the point quickly.', 10), ('Brand consistency', 'Assets feel like one company.', 20), ('Reusable templates', 'Teams move faster next time.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'graphic-design' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Campaign graphics', 'Solve a specific launch or message.', 10), ('Brand systems', 'Define lasting visual rules.', 20), ('Best practice', 'Design campaigns inside the system.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'graphic-design' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Can you work from our existing brand kit?', 'Yes. That is the preferred starting point.', 10), ('Do you deliver editable files?', 'Yes, in agreed formats.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'brand-identity-design', 'Brand Identity Design', 'Brand Identity', 'Brand Identity Design | JZ Enterprises', 'Identity systems — logo, type, color, and usage rules — that make your brand recognizable and easier to apply.', 'Brand Identity Design | JZ Enterprises', 'Identity systems — logo, type, color, and usage rules — that make your brand recognizable and easier to apply.', '/images/services/design.jpg',
  'Brand Identity Design', 'Brand Identity Systems Teams Can Actually Use', 'Define the visual foundations of your brand so every surface stays consistent and recognizable.', 'Discuss Your Project', '/contact', 'Back to Design', '/services/design', '/images/services/design.jpg',
  'What brand identity design means', 'Brand identity design creates the visual system behind your brand — logo, typography, color, and rules that help teams apply it consistently.', '', '', 'How an identity engagement runs', '', 'Why a clear identity matters', 'Make recognition and consistency easier across every channel.',
  'Brand identity FAQs', 'Ready to clarify your identity?', 'Tell us where the brand is used today. We will outline scope.', 'Start a conversation', '/contact', 'What we deliver', 'Identity work focused on clarity and practical use.', 'Problems we solve',
  'Why brands drift and start looking like different companies.', 'Logo-only vs full identity system', 'A logo mark is one asset. An identity system includes type, color, spacing, and usage guidance so teams can create without reinventing the brand each time.', (SELECT id FROM service_pages_active WHERE slug = 'design' LIMIT 1), 40, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'brand-identity-design');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'brand-identity-design' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Logo and mark development', 'Create distinctive marks suited to real applications.', 10), ('Type and color systems', 'Define palettes and type roles that scale.', 20), ('Usage guidelines', 'Document do and do-not patterns teams can follow.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'brand-identity-design' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Inconsistent applications', 'We give teams a system, not only a logo file.', 10), ('Identity that fails in digital UI', 'We design for screens as well as print.', 20), ('Rebrands without rollout plans', 'We include practical adoption guidance.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'brand-identity-design' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Discovery', 'Understand audience, positioning, and constraints.', 10), (2, 'Direction', 'Explore visual territories.', 20), (3, 'System design', 'Lock logo, type, color, and components.', 30), (4, 'Guidelines', 'Document usage for common scenarios.', 40), (5, 'Rollout support', 'Help apply the system to priority surfaces.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'brand-identity-design' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Stronger recognition', 'People remember a coherent look.', 10), ('Faster production', 'Teams stop reinventing basics.', 20), ('Cleaner multi-channel presence', 'Web, social, and sales stay aligned.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'brand-identity-design' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Logo-only delivery', 'A mark without supporting rules.', 10), ('Identity system', 'Rules and assets for consistent application.', 20), ('What most teams need', 'A practical system, not only a symbol.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'brand-identity-design' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Do you rewrite brand strategy?', 'We can align visuals to positioning; deeper strategy can be scoped separately.', 10), ('Will we get a guideline document?', 'Yes, sized to the complexity of the system.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'web-application-security', 'Web Application Security', 'App Security', 'Web Application Security | JZ Enterprises', 'Practical security review and hardening guidance for web apps — auth, access control, and common vulnerability classes.', 'Web Application Security | JZ Enterprises', 'Practical security review and hardening guidance for web apps — auth, access control, and common vulnerability classes.', '/images/services/security.jpg',
  'Web Application Security', 'Web Application Security Focused on Real Risks', 'Review and improve how your web apps handle authentication, access, and untrusted input.', 'Discuss Your Project', '/contact', 'Back to Cyber Security', '/services/cyber-security', '/images/services/security.jpg',
  'What web application security means', 'Web application security is the work of finding and reducing weaknesses in browser-based apps — especially around auth, authorization, and data handling.', '', '', 'How a web app security engagement runs', '', 'Why application security matters', 'Reduce avoidable risk in the software customers and staff use daily.',
  'Web application security FAQs', 'Want a web app security review?', 'Share the app and your concerns. We will propose a scoped approach.', 'Start a conversation', '/contact', 'What we deliver', 'Focused application security work sized to your stack.', 'Problems we solve',
  'Common web app risks that appear as products grow.', 'Secure design vs after-the-fact fixes', 'Secure design builds controls into features early. After-the-fact fixes remediate issues found in running systems. Mature teams use both.', (SELECT id FROM service_pages_active WHERE slug = 'cyber-security' LIMIT 1), 10, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'web-application-security');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-application-security' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Auth and session review', 'Check login, session, and recovery flows for common weaknesses.', 10), ('Access control checks', 'Verify users only reach the data and actions they should.', 20), ('Input and output handling', 'Reduce injection and XSS classes with practical guidance.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-application-security' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Features shipped without security review', 'We add targeted checks around sensitive paths.', 10), ('Unclear ownership of fixes', 'We prioritize findings your team can act on.', 20), ('Copy-paste security checklists', 'We focus on risks that match your architecture.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-application-security' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Scope', 'Define apps, environments, and constraints.', 10), (2, 'Review', 'Assess critical flows and controls.', 20), (3, 'Report', 'Explain findings in plain language with severity.', 30), (4, 'Remediate support', 'Help prioritize and verify fixes.', 40), (5, 'Follow-up', 'Re-check high-priority items after changes.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-application-security' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Clearer risk picture', 'Know what matters most in your apps.', 10), ('Actionable fixes', 'Guidance developers can implement.', 20), ('Safer releases', 'Sensitive paths get deliberate attention.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-application-security' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Secure-by-design work', 'Prevent issues while features are shaped.', 10), ('Remediation work', 'Fix issues found in live or staging systems.', 20), ('Both are useful', 'Prevention plus repair is healthier than either alone.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'web-application-security' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Is this a penetration test?', 'Related but not identical. This work can include reviews and targeted testing based on scope.', 10), ('Do you claim certifications for us?', 'No. We provide practical findings and remediation guidance.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'vulnerability-assessment', 'Vulnerability Assessment', 'Vulnerability Assessment', 'Vulnerability Assessment | JZ Enterprises', 'Structured vulnerability assessment to identify and prioritize weaknesses across agreed systems.', 'Vulnerability Assessment | JZ Enterprises', 'Structured vulnerability assessment to identify and prioritize weaknesses across agreed systems.', '/images/services/security-b.jpg',
  'Vulnerability Assessment', 'Vulnerability Assessment With Clear Priorities', 'Identify weaknesses across agreed systems and rank what to fix first based on exposure and impact.', 'Discuss Your Project', '/contact', 'Back to Cyber Security', '/services/cyber-security', '/images/services/security-b.jpg',
  'What a vulnerability assessment is', 'A vulnerability assessment systematically identifies known weaknesses in systems you authorize us to review, then prioritizes remediation.', '', '', 'How an assessment engagement runs', '', 'Why run assessments', 'Replace guesswork with a prioritized remediation list.',
  'Vulnerability assessment FAQs', 'Ready for an assessment?', 'Tell us which systems are in scope. We will propose an approach.', 'Start a conversation', '/contact', 'What we deliver', 'Structured discovery and prioritization — not fear-based reporting.', 'Problems we solve',
  'Why teams struggle to know what to fix first.', 'Vulnerability assessment vs penetration testing', 'A vulnerability assessment finds and prioritizes weaknesses broadly. Penetration testing goes deeper to validate how issues might be exploited in practice. Many programs use assessment first, then targeted testing.', (SELECT id FROM service_pages_active WHERE slug = 'cyber-security' LIMIT 1), 20, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'vulnerability-assessment');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'vulnerability-assessment' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Scoped discovery', 'Review agreed hosts, apps, or environments.', 10), ('Prioritized findings', 'Rank issues by exposure and business impact.', 20), ('Remediation guidance', 'Explain fixes in language your team can use.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'vulnerability-assessment' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Endless scanner noise', 'We help separate signal from low-value alerts.', 10), ('No shared priority list', 'We produce a backlog stakeholders can agree on.', 20), ('Assessments that never lead to fixes', 'We design reporting for action, not theater.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'vulnerability-assessment' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Scoping', 'Confirm assets, windows, and rules of engagement.', 10), (2, 'Discovery', 'Identify weaknesses within scope.', 20), (3, 'Analysis', 'Prioritize by realistic impact.', 30), (4, 'Reporting', 'Deliver clear findings and next steps.', 40), (5, 'Retest options', 'Verify fixes when requested.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'vulnerability-assessment' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Shared priorities', 'Teams know what to fix first.', 10), ('Reduced noise', 'Focus on issues that matter.', 20), ('Better planning', 'Remediation can enter normal engineering cadence.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'vulnerability-assessment' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Vulnerability assessment', 'Breadth-first discovery and prioritization.', 10), ('Penetration testing', 'Deeper validation of exploitability for agreed targets.', 20), ('Typical sequence', 'Assess broadly, then test what matters most.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'vulnerability-assessment' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Will you scan without permission?', 'No. Scope and authorization come first.', 10), ('Do you guarantee zero vulnerabilities afterward?', 'No. Systems change; we help you manage risk continuously.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'penetration-testing', 'Penetration Testing', 'Penetration Testing', 'Penetration Testing | JZ Enterprises', 'Authorized penetration testing to validate how weaknesses could be exploited in agreed systems.', 'Penetration Testing | JZ Enterprises', 'Authorized penetration testing to validate how weaknesses could be exploited in agreed systems.', '/images/services/security-c.jpg',
  'Penetration Testing', 'Penetration Testing for Authorized Targets', 'Validate real-world exploit paths on systems you explicitly authorize — with clear rules of engagement and practical reporting.', 'Discuss Your Project', '/contact', 'Back to Cyber Security', '/services/cyber-security', '/images/services/security-c.jpg',
  'What penetration testing means', 'Penetration testing is an authorized exercise to attempt exploitation of weaknesses in agreed systems, then report what worked and how to fix it.', '', '', 'How a penetration test engagement runs', '', 'Why penetration testing helps', 'Learn what is realistically exploitable before someone else does.',
  'Penetration testing FAQs', 'Planning a penetration test?', 'Share target systems and timing constraints. We will discuss scope.', 'Start a conversation', '/contact', 'What we deliver', 'Scoped offensive validation with responsible reporting.', 'Problems we solve',
  'When checklists are not enough to understand real exposure.', 'Penetration testing vs vulnerability scanning', 'Scanning finds known signatures and misconfigurations at scale. Penetration testing attempts to chain and validate issues the way an attacker might within agreed rules.', (SELECT id FROM service_pages_active WHERE slug = 'cyber-security' LIMIT 1), 30, NULL
WHERE NOT EXISTS (SELECT 1 FROM service_pages p WHERE p.slug = 'penetration-testing' AND p.archived_at IS NULL);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'penetration-testing' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Scoped testing', 'Work only within authorized targets and windows.', 10), ('Exploit validation', 'Demonstrate impact carefully and responsibly.', 20), ('Remediation-focused reporting', 'Explain paths and fixes without unnecessary jargon.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'penetration-testing' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Findings that lack business context', 'We connect technical impact to what it means for you.', 10), ('Tests without clear rules', 'We define engagement boundaries up front.', 20), ('No path to retest', 'We can verify fixes after remediation when scoped.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'penetration-testing' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Rules of engagement', 'Lock scope, contacts, and constraints.', 10), (2, 'Reconnaissance', 'Gather information within authorization.', 20), (3, 'Exploitation attempts', 'Validate meaningful paths carefully.', 30), (4, 'Reporting', 'Document findings and remediation guidance.', 40), (5, 'Optional retest', 'Confirm critical fixes landed.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'penetration-testing' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Realistic validation', 'See what is exploitable, not only theoretical.', 10), ('Clearer remediation', 'Fix paths that matter first.', 20), ('Better readiness', 'Prepare systems and teams before higher-stakes reviews.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'penetration-testing' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Vulnerability scanning', 'Broad automated discovery of known issues.', 10), ('Penetration testing', 'Deeper, authorized attempt to validate exploit paths.', 20), ('Assessments', 'Useful breadth that often informs where to test.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'penetration-testing' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Is this page published yet?', 'This offering page is intentionally in draft while scope and packaging are finalized.', 10), ('Do you test production without approval?', 'Never. Authorization and windows are mandatory.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'security-hardening', 'Security Hardening', 'Hardening', 'Security Hardening | JZ Enterprises', 'Hardening guidance that reduces attack surface across apps, servers, and cloud configurations you operate.', 'Security Hardening | JZ Enterprises', 'Hardening guidance that reduces attack surface across apps, servers, and cloud configurations you operate.', '/images/services/security-c.jpg',
  'Security Hardening', 'Security Hardening That Shrinks Attack Surface', 'Tighten configurations, access, and baselines so systems are harder to misuse — without theater.', 'Discuss Your Project', '/contact', 'Back to Cyber Security', '/services/cyber-security', '/images/services/security-c.jpg',
  'What security hardening means', 'Security hardening reduces unnecessary exposure by tightening configuration, access, and operational baselines on systems you own.', '', '', 'How a hardening engagement runs', '', 'Why hardening matters', 'Remove easy wins for attackers before investing in complexity.',
  'Security hardening FAQs', 'Want a hardening plan?', 'Tell us which systems matter most. We will prioritize changes.', 'Start a conversation', '/contact', 'What we deliver', 'Practical hardening aligned to your environment.', 'Problems we solve',
  'Why systems stay riskier than they need to be.', 'Hardening vs detection', 'Hardening reduces what an attacker can reach. Detection watches for suspicious activity. You usually need both, starting with basics you can sustain.', (SELECT id FROM service_pages_active WHERE slug = 'cyber-security' LIMIT 1), 40, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'security-hardening');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-hardening' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Baseline configuration', 'Tighten defaults across agreed systems.', 10), ('Access reduction', 'Remove unused accounts, keys, and privileges.', 20), ('Exposure review', 'Close unnecessary services and public paths.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-hardening' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Default configs left in place', 'We apply practical baselines your team can own.', 10), ('Too many standing privileges', 'We reduce access to what roles need.', 20), ('Hardening that breaks operations', 'We sequence changes with rollback awareness.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-hardening' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Inventory', 'Identify systems and current baselines.', 10), (2, 'Prioritize', 'Choose high-impact, low-drama changes first.', 20), (3, 'Apply', 'Implement hardening with clear owners.', 30), (4, 'Verify', 'Confirm intended posture without surprise outages.', 40), (5, 'Document', 'Leave a maintainable baseline checklist.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-hardening' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Smaller attack surface', 'Fewer easy entry points.', 10), ('Clearer ownership', 'Baselines teams can keep.', 20), ('Better foundation', 'Detection and testing become more meaningful.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-hardening' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Hardening', 'Preventive reduction of exposure.', 10), ('Monitoring', 'Detecting issues after they appear.', 20), ('Healthy mix', 'Harden first, then watch what remains.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-hardening' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Will hardening cause downtime?', 'Changes are planned to minimize disruption; some require maintenance windows.', 10), ('Do you harden cloud and servers?', 'Yes, within agreed scope and platforms.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

INSERT INTO service_pages (slug, title, nav_label, meta_title, meta_description, og_title, og_description, og_image_path, hero_eyebrow, hero_h1, hero_description, hero_primary_cta_label, hero_primary_cta_href, hero_secondary_cta_label, hero_secondary_cta_href, hero_image_path, intro_heading, intro_body, offerings_heading, build_heading, process_heading, technologies_heading, benefits_heading, benefits_intro, faqs_heading, cta_heading, cta_body, cta_label, cta_href, capabilities_heading, capabilities_intro, problems_heading, problems_intro, comparison_heading, comparison_body, parent_id, sort_order, published_at)
SELECT
  'security-monitoring-maintenance', 'Security Monitoring & Maintenance', 'Monitoring', 'Security Monitoring and Maintenance | JZ Enterprises', 'Practical monitoring and maintenance cadence for agreed systems — sized to your team and risk.', 'Security Monitoring and Maintenance | JZ Enterprises', 'Practical monitoring and maintenance cadence for agreed systems — sized to your team and risk.', '/images/services/security-b.jpg',
  'Security Monitoring & Maintenance', 'Security Monitoring and Maintenance You Can Sustain', 'Keep agreed systems healthier over time with a monitoring and maintenance cadence that fits your operations.', 'Discuss Your Project', '/contact', 'Back to Cyber Security', '/services/cyber-security', '/images/services/security-b.jpg',
  'What monitoring and maintenance means', 'Security monitoring and maintenance is the ongoing work of watching agreed signals, applying updates, and reviewing posture so systems do not quietly drift into risk.', '', '', 'How a monitoring engagement runs', '', 'Why ongoing maintenance matters', 'Security posture is a process, not a one-time event.',
  'Monitoring and maintenance FAQs', 'Need an ongoing security cadence?', 'Share which systems matter most. We will propose a sustainable plan.', 'Start a conversation', '/contact', 'What we deliver', 'Sustainable cadence — not an operations theater claim.', 'Problems we solve',
  'Why security work decays after a one-time project.', 'Managed monitoring vs self-serve alerts', 'Managed monitoring adds an external operating cadence. Self-serve alerts leave ownership with your team. Choose based on capacity and criticality.', (SELECT id FROM service_pages_active WHERE slug = 'cyber-security' LIMIT 1), 50, now()
WHERE NOT EXISTS (SELECT 1 FROM service_pages_active p WHERE p.slug = 'security-monitoring-maintenance');

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-monitoring-maintenance' LIMIT 1)
INSERT INTO service_page_capabilities (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Signal selection', 'Watch alerts that matter for your systems.', 10), ('Patch and review cadence', 'Keep updates and posture checks on a schedule.', 20), ('Response playbooks', 'Define who does what when something looks wrong.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_capabilities_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-monitoring-maintenance' LIMIT 1)
INSERT INTO service_page_problems (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Alert fatigue', 'We tune for signal, not noise.', 10), ('Drifting configurations', 'We schedule reviews before drift becomes an incident.', 20), ('No owner after projects end', 'We assign clear operating responsibilities.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_problems_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-monitoring-maintenance' LIMIT 1)
INSERT INTO service_page_process_steps (service_page_id, step_number, title, body, sort_order, published_at)
SELECT page.id, v.step_number, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES (1, 'Scope', 'Choose systems and signals worth watching.', 10), (2, 'Baseline', 'Confirm healthy state and contacts.', 20), (3, 'Operate', 'Run the agreed review and update cadence.', 30), (4, 'Respond', 'Follow playbooks when alerts fire.', 40), (5, 'Improve', 'Retune signals and checklists over time.', 50)) AS v(step_number, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_process_steps_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-monitoring-maintenance' LIMIT 1)
INSERT INTO service_page_benefits (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Less drift', 'Systems stay closer to an agreed baseline.', 10), ('Clearer ownership', 'Someone is responsible for follow-through.', 20), ('Practical pace', 'Cadence matches your risk and capacity.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_benefits_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-monitoring-maintenance' LIMIT 1)
INSERT INTO service_page_comparison_points (service_page_id, title, body, sort_order, published_at)
SELECT page.id, v.title, v.body, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Managed cadence', 'External help operating the watch and review loop.', 10), ('Self-serve alerts', 'Your team owns triage end to end.', 20), ('Right-sizing', 'Pick the model you can actually sustain.', 30)) AS v(title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_comparison_points_active x WHERE x.service_page_id = page.id AND x.title = v.title);

WITH page AS (SELECT id, published_at FROM service_pages_active WHERE slug = 'security-monitoring-maintenance' LIMIT 1)
INSERT INTO service_page_faqs (service_page_id, question, answer, sort_order, published_at)
SELECT page.id, v.question, v.answer, v.sort_order, page.published_at
FROM page CROSS JOIN (VALUES ('Is this a round-the-clock operations center?', 'No. We provide a practical monitoring and maintenance cadence sized to your systems and risk.', 10), ('Can you work with our existing tools?', 'Often yes. We prefer to use what you already operate when it fits.', 20)) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM service_page_faqs_active x WHERE x.service_page_id = page.id AND x.question = v.question);

-- Related

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 10, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'web-design'
WHERE a.slug = 'web-development'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 20, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'web-development'
WHERE a.slug = 'web-design'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 10, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'technical-seo'
WHERE a.slug = 'web-design'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 20, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'web-design'
WHERE a.slug = 'technical-seo'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 10, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'technical-seo'
WHERE a.slug = 'web-development'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 20, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'web-development'
WHERE a.slug = 'technical-seo'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 10, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'ecommerce-seo'
WHERE a.slug = 'ecommerce-development'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 20, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'ecommerce-development'
WHERE a.slug = 'ecommerce-seo'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 10, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'penetration-testing'
WHERE a.slug = 'vulnerability-assessment'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 20, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'vulnerability-assessment'
WHERE a.slug = 'penetration-testing'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 10, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'security-hardening'
WHERE a.slug = 'penetration-testing'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 20, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'penetration-testing'
WHERE a.slug = 'security-hardening'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 10, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'security-hardening'
WHERE a.slug = 'vulnerability-assessment'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

INSERT INTO service_page_related (service_page_id, related_service_page_id, sort_order, published_at)
SELECT a.id, b.id, 20, COALESCE(a.published_at, now())
FROM service_pages_active a
JOIN service_pages_active b ON b.slug = 'vulnerability-assessment'
WHERE a.slug = 'security-hardening'
  AND NOT EXISTS (SELECT 1 FROM service_page_related_active r WHERE r.service_page_id = a.id AND r.related_service_page_id = b.id);

-- Keep custom-development offerings pointing at child paths.
UPDATE service_page_offerings o
SET cta_href = v.cta_href, updated_at = now()
FROM service_pages_active p
CROSS JOIN (VALUES
  ('Web Development', '/services/custom-development/web-development'),
  ('Mobile App Development', '/services/custom-development/mobile-app-development'),
  ('Custom Software Development', '/services/custom-development/custom-software-development'),
  ('Web Application Development', '/services/custom-development/web-app-development'),
  ('E-commerce Development', '/services/custom-development/ecommerce-development')
) AS v(title, cta_href)
WHERE o.service_page_id = p.id AND p.slug = 'custom-development' AND o.archived_at IS NULL
  AND o.title = v.title AND o.cta_href IS DISTINCT FROM v.cta_href;

COMMIT;
