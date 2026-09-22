import fs from "node:fs";

function id() {
  return `b${Math.random().toString(36).slice(2, 10)}`;
}

function doc(blocks) {
  return JSON.stringify({ version: 1, blocks });
}

function p(text) {
  return { id: id(), type: "paragraph", text };
}
function h(text, level = 2) {
  return { id: id(), type: "heading", level, text };
}
function list(items) {
  return { id: id(), type: "list", style: "unordered", items };
}

const posts = [
  {
    title: "What is custom software development?",
    slug: "what-is-custom-software-development",
    excerpt:
      "A clear definition of custom software development, when it fits, and how it differs from buying a product.",
    image_path: "/images/services/software.jpg",
    category: "Custom Software",
    body: doc([
      p(
        "Custom software development is the design and build of software shaped around your processes, roles, and data — instead of configuring a generic product until it almost fits.",
      ),
      h("When custom software is the right fit"),
      p(
        "Choose custom software development when workflows, permissions, or integrations are unique enough that off-the-shelf tools become permanent workarounds. Choose a product when your process already matches a mature category tool.",
      ),
      h("What you typically get"),
      list([
        "Workflow-aligned screens and roles",
        "Integrations with systems you already run",
        "Ownership of the codebase and release path",
        "Room to evolve without fighting a vendor roadmap",
      ]),
      h("How Jump If Zero approaches it"),
      p(
        "We map the operating model first, then ship incremental releases you can review. Explore custom software development services at /services/custom-development/custom-software-development, or compare approaches in our custom software vs off-the-shelf guide.",
      ),
      p("Ready to scope a system? Contact JZ Enterprises at /contact."),
    ]),
  },
  {
    title: "Custom software vs off-the-shelf software",
    slug: "custom-software-vs-off-the-shelf",
    excerpt:
      "A practical comparison to decide between custom software development and packaged products.",
    image_path: "/images/services/software-b.jpg",
    category: "Custom Software",
    body: doc([
      p(
        "Teams often ask whether to buy a product or invest in custom software development. The useful answer is about fit, not ideology.",
      ),
      h("Off-the-shelf software"),
      p(
        "Packaged tools win when your process is standard, time-to-value matters more than uniqueness, and the vendor roadmap covers your next two years.",
      ),
      h("Custom software development"),
      p(
        "Custom software wins when unique workflows, compliance rules, or integrations make product configuration a permanent compromise — and when owning the system is part of the business advantage.",
      ),
      h("Decision factors"),
      list([
        "How unique are the workflows?",
        "How many systems must connect cleanly?",
        "Who needs to own changes after launch?",
        "What is the cost of fighting the product for the next three years?",
      ]),
      p(
        "JZ Enterprises helps you decide honestly, then builds when custom is justified. See /services/custom-development/custom-software-development or start at /contact.",
      ),
    ]),
  },
  {
    title: "Custom software development process",
    slug: "custom-software-development-process",
    excerpt:
      "How a custom software development engagement typically runs from discovery to handoff.",
    image_path: "/images/services/software-c.jpg",
    category: "Custom Software",
    body: doc([
      p(
        "A reliable custom software development process keeps scope visible and increments reviewable.",
      ),
      h("Typical phases"),
      list([
        "Discovery — goals, roles, constraints, success criteria",
        "Workflow and experience design — map the jobs the system must support",
        "Incremental build — ship slices that stakeholders can use",
        "Hardening — tests, edge cases, operational readiness",
        "Handoff — docs, ownership, and a practical release path",
      ]),
      h("Why process matters"),
      p(
        "Without milestones, custom software projects drift. With them, trade-offs stay explicit and costs stay tied to outcomes.",
      ),
      p(
        "Learn more at /services/custom-development/custom-software-development or read our custom software development cost guide.",
      ),
    ]),
  },
  {
    title: "Custom software development cost",
    slug: "custom-software-development-cost",
    excerpt:
      "What drives custom software development cost — and how to scope a realistic range.",
    image_path: "/images/services/software.jpg",
    category: "Custom Software",
    body: doc([
      p(
        "How much does custom software development cost? There is no honest single number. Cost follows scope.",
      ),
      h("Cost drivers"),
      list([
        "Number of roles and workflows",
        "Integrations and data migration",
        "Compliance and audit needs",
        "Design depth and device coverage",
        "Ongoing ownership expectations",
      ]),
      h("How we quote"),
      p(
        "After a short discovery, JZ Enterprises shares a scoped range with assumptions. That keeps custom software development cost tied to what you actually need — not a padded guess.",
      ),
      p(
        "Read the process overview, then scope a build at /services/custom-development/custom-software-development or /contact.",
      ),
    ]),
  },
  {
    title: "What is web development?",
    slug: "what-is-web-development",
    excerpt:
      "A plain-language definition of web development and how it differs from web applications.",
    image_path: "/images/services/website.jpg",
    category: "Web Development",
    body: doc([
      p(
        "Web development is the work of designing and building websites people browse, read, and convert through — structure, content templates, performance, forms, and integrations.",
      ),
      h("Website vs web application"),
      p(
        "A website primarily publishes and converts. A web application supports ongoing, often authenticated workflows. Many businesses need both: a marketing site plus a product or portal.",
      ),
      h("What good web development services include"),
      list([
        "Clear information architecture",
        "Responsive, maintainable front ends",
        "Forms and lead flows",
        "Room for content growth without redesigning everything",
      ]),
      p(
        "JZ Enterprises offers web development services at /services/custom-development/web-development. For budgeting, see our website development cost guide.",
      ),
    ]),
  },
  {
    title: "How much does website development cost?",
    slug: "website-development-cost",
    excerpt:
      "Practical drivers of website development cost and how to budget a scoped site.",
    image_path: "/images/services/website-b.jpg",
    category: "Web Development",
    body: doc([
      p(
        "Website development cost depends on page count, content readiness, design depth, and integrations — not a fixed package label.",
      ),
      h("What raises cost"),
      list([
        "Large content models and many templates",
        "Custom design systems",
        "Complex forms and CRM integrations",
        "Performance and accessibility requirements",
      ]),
      h("What keeps cost predictable"),
      p(
        "Scoped phases, ready content, and a clear definition of done for the first release.",
      ),
      p(
        "Explore professional web development services at /services/custom-development/web-development or talk with us at /contact.",
      ),
    ]),
  },
  {
    title: "Mobile app development process",
    slug: "mobile-app-development-process",
    excerpt:
      "How mobile app development engagements move from discovery to launch support.",
    image_path: "/images/services/app.jpg",
    category: "Mobile",
    body: doc([
      p(
        "A clear mobile app development process reduces thrash between idea and store-ready release.",
      ),
      h("Phases we use"),
      list([
        "Discovery and task mapping",
        "Experience design and prototypes",
        "Incremental build",
        "Test and harden",
        "Launch support and handoff",
      ]),
      h("Platform choice sits inside the process"),
      p(
        "Native vs cross-platform is a product decision. We weigh device needs, timeline, and long-term ownership. See our native vs cross-platform guide and mobile app development services.",
      ),
    ]),
  },
  {
    title: "Native vs cross-platform app development",
    slug: "native-vs-cross-platform-apps",
    excerpt:
      "When native iOS/Android fits — and when Flutter or React Native is the better custom mobile path.",
    image_path: "/images/services/app-b.jpg",
    category: "Mobile",
    body: doc([
      p(
        "Native vs cross-platform app development is about fit, not fashion.",
      ),
      h("Native"),
      p(
        "Best when you need deep platform behavior or distinctly different iOS and Android experiences.",
      ),
      h("Cross-platform (Flutter, React Native)"),
      p(
        "Useful when one product can share most UI and logic across platforms while still feeling solid on each device.",
      ),
      h("How we decide"),
      p(
        "Device requirements, team skills, timeline, and who will own releases after launch. Continue at /services/custom-development/mobile-app-development or /contact.",
      ),
    ]),
  },
];

function sqlString(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

const updateExisting = `
UPDATE blog_posts SET
  title = 'Ship the system, not the slide deck',
  excerpt = 'Why scoped custom software and web delivery beats endless discovery decks.',
  body = ${sqlString(
    doc([
      p(
        "Scoped delivery means you leave with working software development — websites, custom software, and apps — not another presentation.",
      ),
      p(
        "We start from goals and constraints, then ship reviewable milestones. That keeps custom software development and web development honest: every phase changes something your team can use.",
      ),
      p(
        "If you are choosing a software development company, ask how they prove progress before the final invoice. JZ Enterprises answers with increments you can run.",
      ),
      p(
        "Related reading: what is custom software development, and our Custom Development services at /services/custom-development.",
      ),
    ]),
  )},
  category = 'Custom Software',
  updated_at = now()
WHERE slug = 'ship-the-system' AND archived_at IS NULL;

UPDATE blog_posts SET
  title = 'SEO that maps to pipeline',
  excerpt = 'Intent-led SEO for software and service businesses — not vanity rankings.',
  body = ${sqlString(
    doc([
      p(
        "Search visibility matters when it creates conversations. Technical foundations, clear service pages, and content that answers buyer questions turn SEO into pipeline.",
      ),
      p(
        "For software development companies, that usually means strong pages for custom software development, web development services, and supporting Insights that explain process and cost without fluff.",
      ),
      p(
        "Related: web development services at /services/custom-development/web-development and /contact.",
      ),
    ]),
  )},
  category = 'Growth',
  updated_at = now()
WHERE slug = 'seo-that-maps-to-pipeline' AND archived_at IS NULL;
`;

const values = posts
  .map(
    (post) => `(
    ${sqlString(post.title)},
    ${sqlString(post.slug)},
    ${sqlString(post.excerpt)},
    ${sqlString(post.body)},
    ${sqlString(post.image_path)},
    ${sqlString(post.category)}
  )`,
  )
  .join(",\n  ");

const sql = `BEGIN;
${updateExisting}

INSERT INTO blog_posts (title, slug, excerpt, body, image_path, category, published_at)
SELECT v.title, v.slug, v.excerpt, v.body, v.image_path, v.category, now()
FROM (VALUES
  ${values}
) AS v(title, slug, excerpt, body, image_path, category)
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts_active b WHERE b.slug = v.slug
);

COMMIT;
`;

fs.writeFileSync("database/seeds/dev/009_seo_insights.sql", sql);
console.log("wrote 009_seo_insights.sql", posts.length, "new posts");
