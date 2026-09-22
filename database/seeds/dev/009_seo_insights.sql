BEGIN;

UPDATE blog_posts SET
  title = 'Ship the system, not the slide deck',
  excerpt = 'Why scoped custom software and web delivery beats endless discovery decks.',
  body = '{"version":1,"blocks":[{"id":"b9u50mapa","type":"paragraph","text":"Scoped delivery means you leave with working software development — websites, custom software, and apps — not another presentation."},{"id":"brpp2k6jg","type":"paragraph","text":"We start from goals and constraints, then ship reviewable milestones. That keeps custom software development and web development honest: every phase changes something your team can use."},{"id":"bfk1lf2sd","type":"paragraph","text":"If you are choosing a software development company, ask how they prove progress before the final invoice. JZ Enterprises answers with increments you can run."},{"id":"b86no812d","type":"paragraph","text":"Related reading: what is custom software development, and our Custom Development services at /services/custom-development."}]}',
  category = 'Custom Software',
  updated_at = now()
WHERE slug = 'ship-the-system' AND archived_at IS NULL;

UPDATE blog_posts SET
  title = 'SEO that maps to pipeline',
  excerpt = 'Intent-led SEO for software and service businesses — not vanity rankings.',
  body = '{"version":1,"blocks":[{"id":"bme2v88be","type":"paragraph","text":"Search visibility matters when it creates conversations. Technical foundations, clear service pages, and content that answers buyer questions turn SEO into pipeline."},{"id":"bwo3vt6p1","type":"paragraph","text":"For software development companies, that usually means strong pages for custom software development, web development services, and supporting Insights that explain process and cost without fluff."},{"id":"bhc8u34gi","type":"paragraph","text":"Related: web development services at /services/custom-development/web-development and /contact."}]}',
  category = 'Growth',
  updated_at = now()
WHERE slug = 'seo-that-maps-to-pipeline' AND archived_at IS NULL;


INSERT INTO blog_posts (title, slug, excerpt, body, image_path, category, published_at)
SELECT v.title, v.slug, v.excerpt, v.body, v.image_path, v.category, now()
FROM (VALUES
  (
    'What is custom software development?',
    'what-is-custom-software-development',
    'A clear definition of custom software development, when it fits, and how it differs from buying a product.',
    '{"version":1,"blocks":[{"id":"bny10tcv4","type":"paragraph","text":"Custom software development is the design and build of software shaped around your processes, roles, and data — instead of configuring a generic product until it almost fits."},{"id":"bmjhkuep9","type":"heading","level":2,"text":"When custom software is the right fit"},{"id":"br4gj9ysl","type":"paragraph","text":"Choose custom software development when workflows, permissions, or integrations are unique enough that off-the-shelf tools become permanent workarounds. Choose a product when your process already matches a mature category tool."},{"id":"bud2wqamp","type":"heading","level":2,"text":"What you typically get"},{"id":"bskcexl0g","type":"list","style":"unordered","items":["Workflow-aligned screens and roles","Integrations with systems you already run","Ownership of the codebase and release path","Room to evolve without fighting a vendor roadmap"]},{"id":"bu2uml9s9","type":"heading","level":2,"text":"How Jump If Zero approaches it"},{"id":"b51krv3u6","type":"paragraph","text":"We map the operating model first, then ship incremental releases you can review. Explore custom software development services at /services/custom-development/custom-software-development, or compare approaches in our custom software vs off-the-shelf guide."},{"id":"bljzpryot","type":"paragraph","text":"Ready to scope a system? Contact JZ Enterprises at /contact."}]}',
    '/images/services/software.jpg',
    'Custom Software'
  ),
  (
    'Custom software vs off-the-shelf software',
    'custom-software-vs-off-the-shelf',
    'A practical comparison to decide between custom software development and packaged products.',
    '{"version":1,"blocks":[{"id":"bfm8o7kn2","type":"paragraph","text":"Teams often ask whether to buy a product or invest in custom software development. The useful answer is about fit, not ideology."},{"id":"b8qdvwiea","type":"heading","level":2,"text":"Off-the-shelf software"},{"id":"b0i92cdem","type":"paragraph","text":"Packaged tools win when your process is standard, time-to-value matters more than uniqueness, and the vendor roadmap covers your next two years."},{"id":"byksh3pb1","type":"heading","level":2,"text":"Custom software development"},{"id":"b70hufp5q","type":"paragraph","text":"Custom software wins when unique workflows, compliance rules, or integrations make product configuration a permanent compromise — and when owning the system is part of the business advantage."},{"id":"bnprk9atm","type":"heading","level":2,"text":"Decision factors"},{"id":"b8mik7u2u","type":"list","style":"unordered","items":["How unique are the workflows?","How many systems must connect cleanly?","Who needs to own changes after launch?","What is the cost of fighting the product for the next three years?"]},{"id":"b1t7attkh","type":"paragraph","text":"JZ Enterprises helps you decide honestly, then builds when custom is justified. See /services/custom-development/custom-software-development or start at /contact."}]}',
    '/images/services/software-b.jpg',
    'Custom Software'
  ),
  (
    'Custom software development process',
    'custom-software-development-process',
    'How a custom software development engagement typically runs from discovery to handoff.',
    '{"version":1,"blocks":[{"id":"bwmdn6uz2","type":"paragraph","text":"A reliable custom software development process keeps scope visible and increments reviewable."},{"id":"bnzey4o7c","type":"heading","level":2,"text":"Typical phases"},{"id":"bnfxml49v","type":"list","style":"unordered","items":["Discovery — goals, roles, constraints, success criteria","Workflow and experience design — map the jobs the system must support","Incremental build — ship slices that stakeholders can use","Hardening — tests, edge cases, operational readiness","Handoff — docs, ownership, and a practical release path"]},{"id":"bk5jlg922","type":"heading","level":2,"text":"Why process matters"},{"id":"b9kytj89x","type":"paragraph","text":"Without milestones, custom software projects drift. With them, trade-offs stay explicit and costs stay tied to outcomes."},{"id":"b8tf9zad8","type":"paragraph","text":"Learn more at /services/custom-development/custom-software-development or read our custom software development cost guide."}]}',
    '/images/services/software-c.jpg',
    'Custom Software'
  ),
  (
    'Custom software development cost',
    'custom-software-development-cost',
    'What drives custom software development cost — and how to scope a realistic range.',
    '{"version":1,"blocks":[{"id":"bujalliqf","type":"paragraph","text":"How much does custom software development cost? There is no honest single number. Cost follows scope."},{"id":"b3h9jpb5b","type":"heading","level":2,"text":"Cost drivers"},{"id":"b87loabot","type":"list","style":"unordered","items":["Number of roles and workflows","Integrations and data migration","Compliance and audit needs","Design depth and device coverage","Ongoing ownership expectations"]},{"id":"bn289o5v7","type":"heading","level":2,"text":"How we quote"},{"id":"bjjf1f5hj","type":"paragraph","text":"After a short discovery, JZ Enterprises shares a scoped range with assumptions. That keeps custom software development cost tied to what you actually need — not a padded guess."},{"id":"b1mdx67j0","type":"paragraph","text":"Read the process overview, then scope a build at /services/custom-development/custom-software-development or /contact."}]}',
    '/images/services/software.jpg',
    'Custom Software'
  ),
  (
    'What is web development?',
    'what-is-web-development',
    'A plain-language definition of web development and how it differs from web applications.',
    '{"version":1,"blocks":[{"id":"bg93ruqxj","type":"paragraph","text":"Web development is the work of designing and building websites people browse, read, and convert through — structure, content templates, performance, forms, and integrations."},{"id":"bqccve6b3","type":"heading","level":2,"text":"Website vs web application"},{"id":"bo0wzy707","type":"paragraph","text":"A website primarily publishes and converts. A web application supports ongoing, often authenticated workflows. Many businesses need both: a marketing site plus a product or portal."},{"id":"b6yeunsiv","type":"heading","level":2,"text":"What good web development services include"},{"id":"b3iqlrd2l","type":"list","style":"unordered","items":["Clear information architecture","Responsive, maintainable front ends","Forms and lead flows","Room for content growth without redesigning everything"]},{"id":"b4pl63jwe","type":"paragraph","text":"JZ Enterprises offers web development services at /services/custom-development/web-development. For budgeting, see our website development cost guide."}]}',
    '/images/services/website.jpg',
    'Web Development'
  ),
  (
    'How much does website development cost?',
    'website-development-cost',
    'Practical drivers of website development cost and how to budget a scoped site.',
    '{"version":1,"blocks":[{"id":"bs0ttfk8x","type":"paragraph","text":"Website development cost depends on page count, content readiness, design depth, and integrations — not a fixed package label."},{"id":"barbgorai","type":"heading","level":2,"text":"What raises cost"},{"id":"bxcyw6624","type":"list","style":"unordered","items":["Large content models and many templates","Custom design systems","Complex forms and CRM integrations","Performance and accessibility requirements"]},{"id":"b7rffrllm","type":"heading","level":2,"text":"What keeps cost predictable"},{"id":"bh2gw44qy","type":"paragraph","text":"Scoped phases, ready content, and a clear definition of done for the first release."},{"id":"b8yny4yro","type":"paragraph","text":"Explore professional web development services at /services/custom-development/web-development or talk with us at /contact."}]}',
    '/images/services/website-b.jpg',
    'Web Development'
  ),
  (
    'Mobile app development process',
    'mobile-app-development-process',
    'How mobile app development engagements move from discovery to launch support.',
    '{"version":1,"blocks":[{"id":"bp1y4leah","type":"paragraph","text":"A clear mobile app development process reduces thrash between idea and store-ready release."},{"id":"bfh89anbt","type":"heading","level":2,"text":"Phases we use"},{"id":"bur64zk1s","type":"list","style":"unordered","items":["Discovery and task mapping","Experience design and prototypes","Incremental build","Test and harden","Launch support and handoff"]},{"id":"bhks9bdwl","type":"heading","level":2,"text":"Platform choice sits inside the process"},{"id":"bsomkwmiu","type":"paragraph","text":"Native vs cross-platform is a product decision. We weigh device needs, timeline, and long-term ownership. See our native vs cross-platform guide and mobile app development services."}]}',
    '/images/services/app.jpg',
    'Mobile'
  ),
  (
    'Native vs cross-platform app development',
    'native-vs-cross-platform-apps',
    'When native iOS/Android fits — and when Flutter or React Native is the better custom mobile path.',
    '{"version":1,"blocks":[{"id":"b2rizlzlk","type":"paragraph","text":"Native vs cross-platform app development is about fit, not fashion."},{"id":"bh5tbsy2p","type":"heading","level":2,"text":"Native"},{"id":"bmpl0n4l1","type":"paragraph","text":"Best when you need deep platform behavior or distinctly different iOS and Android experiences."},{"id":"bl9d3evz7","type":"heading","level":2,"text":"Cross-platform (Flutter, React Native)"},{"id":"blfpx6irl","type":"paragraph","text":"Useful when one product can share most UI and logic across platforms while still feeling solid on each device."},{"id":"bx6m4zbol","type":"heading","level":2,"text":"How we decide"},{"id":"bhy8qua59","type":"paragraph","text":"Device requirements, team skills, timeline, and who will own releases after launch. Continue at /services/custom-development/mobile-app-development or /contact."}]}',
    '/images/services/app-b.jpg',
    'Mobile'
  )
) AS v(title, slug, excerpt, body, image_path, category)
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts_active b WHERE b.slug = v.slug
);

COMMIT;
