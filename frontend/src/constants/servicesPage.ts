export const servicesPageCopy = {
  heroLead: "Software, web, and growth.",
  heroRest: "One delivery system.",
  heroSupport:
    "Custom software development, web development, mobile apps, SEO, marketing, design, and cyber security — hired as coherent workstreams.",
  offeringsTitle: "Explore our services",
  offeringsLede:
    "Start with Custom Development for product build work, then layer SEO, marketing, design, and security where growth needs them.",
  processTitle: "How engagements run",
  processLede: "Clear ownership from first brief to launch.",
  process: [
    {
      index: "01",
      title: "Scope",
      body: "Goals, constraints, and what “done” means — before a single pixel ships.",
      accent: "brand",
    },
    {
      index: "02",
      title: "Build",
      body: "Design and development as one system — conversion-first, owned end to end.",
      accent: "secondary",
    },
    {
      index: "03",
      title: "Grow",
      body: "SEO, social, and iteration so attention turns into measurable pipeline.",
      accent: "brand",
    },
  ],
  ctaTitle: "Ready to scope the next build?",
  ctaLede: "Tell us what you are building. We reply with a clear next step.",
  ctaLabel: "Start a scoped engagement",
  ctaHref: "/contact",
} as const;

export const serviceFanCards = [
  {
    title: "Custom Development",
    region: "Build",
    image: "/images/services/website.jpg",
  },
  {
    title: "SEO",
    region: "Intent",
    image: "/images/services/seo.jpg",
  },
  {
    title: "Digital Marketing",
    region: "Reach",
    image: "/images/services/smm.jpg",
  },
  {
    title: "Design",
    region: "Craft",
    image: "/images/services/design.jpg",
  },
  {
    title: "Cyber Security",
    region: "Protect",
    image: "/images/services/security.jpg",
  },
] as const;

export type ServicePillarBlurb = {
  readonly slug: string;
  readonly quote: string;
  readonly title: string;
  readonly body: string;
  readonly image: string;
  readonly imageAlt: string;
  readonly highlights: readonly [string, string, string];
};

export const servicePillarBlurbs: readonly ServicePillarBlurb[] = [
  {
    slug: "custom-development",
    quote: "Build once. Own the system.",
    title: "Custom software and web products built around your workflows.",
    body: "Web development, mobile apps, and custom software development under one practice — with clear ownership after launch.",
    image: "/images/services/website.jpg",
    imageAlt: "Custom software and web development work",
    highlights: [
      "Web, mobile, and custom software under one practice",
      "Architecture that survives the next release",
      "Handoffs your team can operate",
    ],
  },
  {
    slug: "seo",
    quote: "Rank where buyers already search.",
    title: "Search visibility that turns into real pipeline.",
    body: "Technical, local, international, commerce, and answer-led SEO — without vanity metrics.",
    image: "/images/services/seo.jpg",
    imageAlt: "SEO services",
    highlights: [
      "Site health and crawlability",
      "Intent-led content systems",
      "Clear reporting tied to business goals",
    ],
  },
  {
    slug: "digital-marketing",
    quote: "Attention that earns a next step.",
    title: "Campaigns that connect presence to action.",
    body: "Paid, social, content, email, and conversion work measured against real conversations.",
    image: "/images/services/smm.jpg",
    imageAlt: "Digital marketing",
    highlights: [
      "Channel strategy with clear priorities",
      "Creative and landing-page alignment",
      "Loops from attention to action",
    ],
  },
  {
    slug: "design",
    quote: "Clarity first. Craft that holds.",
    title: "Design systems that feel premium and clear.",
    body: "UI/UX, web, graphic, and brand identity ready for handoff and real use.",
    image: "/images/services/design.jpg",
    imageAlt: "Design services",
    highlights: [
      "Research-backed flows and layouts",
      "Visual systems that scale",
      "Assets ready for web and campaigns",
    ],
  },
  {
    slug: "cyber-security",
    quote: "Reduce risk without burying the team.",
    title: "Practical security that supports growth.",
    body: "Application security, assessment, hardening, and maintenance — scoped and clear.",
    image: "/images/services/security.jpg",
    imageAlt: "Cyber security",
    highlights: [
      "Web application security focus",
      "Assessment and hardening paths",
      "Maintenance that keeps pace with change",
    ],
  },
] as const;

export function getServicePillarBlurb(
  slug: string,
): ServicePillarBlurb | undefined {
  return servicePillarBlurbs.find((item) => item.slug === slug);
}
