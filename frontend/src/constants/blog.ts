export const blogCopy = {
  watermark: "Blog",
  title: "Insights that ship",
  lede: "Practical notes on websites, software, brand, and growth — written for teams who care about outcomes.",
  gridTitle: "Latest posts",
  gridLede: "Clear thinking. No agency fog.",
  ctaTitle: "Ready to turn an insight into a build?",
  ctaLede: "Tell us what you are building. We reply with a clear next step.",
  ctaLabel: "Start a scoped engagement",
  ctaHref: "/contact" as const,
  backLabel: "Back to blog",
  readLabel: "Read",
} as const;

export const blogPosts = [
  {
    slug: "conversion-first-websites",
    title: "Why conversion-first websites outperform pretty templates",
    excerpt:
      "A site should sell while you sleep. Hierarchy, speed, and clear paths matter more than decoration.",
    category: "Website",
    date: "2026-06-12",
    dateLabel: "Jun 12, 2026",
    readTime: "5 min",
    image: "/images/services/website.jpg",
    imageAlt: "Website on a laptop",
    author: "JZ Enterprises",
    body: [
      "Most websites fail quietly. They look finished, pass a design review, then stall when real visitors arrive. The gap is rarely “not enough animation.” It is unclear hierarchy, slow loads, and no path from attention to action.",
      "A conversion-first build starts with what “done” means: which audience, which offer, which next step. Every section earns its place against that outcome — not against a moodboard.",
      "We treat design and development as one system. Typography, spacing, and performance are not polish passes; they are part of how the page sells. When those pieces move together, the site stays sharp after launch instead of aging into a template you outgrow.",
      "If you are rebuilding, keep what works, cut what slows the funnel, and ship a structure you can grow without starting over.",
    ],
  },
  {
    slug: "software-that-fits-the-workflow",
    title: "Custom software should fit the team — not the other way around",
    excerpt:
      "Internal tools fail when they force new habits. Map the work first, then build the system around it.",
    category: "Software",
    date: "2026-05-28",
    dateLabel: "May 28, 2026",
    readTime: "6 min",
    image: "/images/services/software.jpg",
    imageAlt: "Software development workspace",
    author: "JZ Enterprises",
    body: [
      "Off-the-shelf platforms promise speed and deliver friction. Teams invent workarounds, spreadsheets creep back in, and the “system of record” becomes a system of exceptions.",
      "Custom software earns its cost when it matches how people already move work forward. That means workflow mapping before screens, clear ownership of data, and architecture that survives the next release.",
      "We build for maintainability: reliable APIs, readable code, and roadmaps that do not collapse under the first change request. Scale is not a buzzword — it is whether the tool still helps when the team doubles.",
      "Start with the bottleneck. Ship the smallest system that removes it. Then iterate with evidence, not feature lists.",
    ],
  },
  {
    slug: "mobile-apps-with-retention",
    title: "Mobile apps that feel useful on day one — and day thirty",
    excerpt:
      "Launch speed matters. Retention matters more. Clarity in the hand beats feature count.",
    category: "App",
    date: "2026-05-09",
    dateLabel: "May 9, 2026",
    readTime: "4 min",
    image: "/images/services/app.jpg",
    imageAlt: "Mobile app on a smartphone",
    author: "JZ Enterprises",
    body: [
      "An app that impresses in a demo and confuses in daily use is not a product — it is a prototype wearing makeup. Useful in the hand means fast loads, obvious next actions, and decisions tied to retention.",
      "We scope MVPs around the job the user hires the app to do. Extra screens wait until the core loop is proven. That keeps launch timelines honest and budgets pointed at outcomes.",
      "Cross-platform craft still needs product judgment: what belongs on mobile, what belongs on web, and what should never become an app at all.",
      "If you are shipping soon, pressure-test the first-session path. If a new user cannot succeed in minutes, the store listing will not save you.",
    ],
  },
  {
    slug: "seo-for-intent-not-vanity",
    title: "SEO that targets intent — not vanity keywords",
    excerpt:
      "Rank where customers already search. Technical health and content systems beat keyword theater.",
    category: "Growth",
    date: "2026-04-22",
    dateLabel: "Apr 22, 2026",
    readTime: "5 min",
    image: "/images/services/seo.jpg",
    imageAlt: "SEO and analytics charts",
    author: "JZ Enterprises",
    body: [
      "Vanity rankings feel good in a screenshot and do nothing for pipeline. Intent-led SEO starts with what people mean when they search — and whether your site can answer that meaning with a clear next step.",
      "Technical foundations matter: crawlability, speed, structure. Then content systems that map to real questions, not recycled blog filler.",
      "We report against leads and revenue paths, not only positions. If search traffic does not convert, the strategy is incomplete.",
      "Audit what you have, keep what works, replace what stalls, and build a loop you can run every month without reinventing the calendar.",
    ],
  },
  {
    slug: "brand-systems-that-hold",
    title: "Brand systems that stay premium across every touchpoint",
    excerpt:
      "Design that speaks before you do. Consistency is the difference between a campaign and a brand.",
    category: "Brand",
    date: "2026-04-03",
    dateLabel: "Apr 3, 2026",
    readTime: "4 min",
    image: "/images/services/design.jpg",
    imageAlt: "Brand design materials",
    author: "JZ Enterprises",
    body: [
      "A logo file is not a brand system. Premium presence comes from rules that hold under pressure: web, social, product UI, and print without visual noise.",
      "We build kits teams can actually use — type, color, spacing, and campaign language that survive the next launch cycle.",
      "Creative direction should still respect conversion. Beautiful work that hides the CTA is incomplete work.",
      "If your assets look different on every channel, the fix is not another one-off. It is a system with ownership.",
    ],
  },
  {
    slug: "stabilize-before-you-scale",
    title: "Fix bugs fast — then stabilize so downtime stays rare",
    excerpt:
      "Speed without judgment creates temporary patches. Diagnose root causes, ship durable fixes, leave the system stronger.",
    category: "Engineering",
    date: "2026-03-18",
    dateLabel: "Mar 18, 2026",
    readTime: "5 min",
    image: "/images/services/bugfix.jpg",
    imageAlt: "Debugging and system repair",
    author: "JZ Enterprises",
    body: [
      "Production breaks at the worst time. The wrong response is a stack of temporary patches that make the next outage louder.",
      "We triage quickly, find root causes, and ship fixes the team can own — with notes that survive handoff.",
      "Stabilization is part of growth. You cannot scale a funnel sitting on fragile infrastructure.",
      "If incidents keep repeating, stop treating symptoms. Scope a stabilization pass before the next feature sprint.",
    ],
  },
] as const;

export type BlogPost = (typeof blogPosts)[number];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(
  slug: string,
  limit = 3,
): readonly BlogPost[] {
  return blogPosts.filter((post) => post.slug !== slug).slice(0, limit);
}
