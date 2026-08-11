export const portfolioCopy = {
  watermark: "Portfolio",
  heroLead: "Selected work.",
  heroRest: "Proof over promises.",
  heroSupport:
    "Websites, software, apps, and brand systems — built to convert, scale, and hold up in the wild.",
  gridTitle: "Recent engagements",
  featuredEyebrow: "Featured case",
  featuredTitle: "Conversion-first website for a growth-stage brand.",
  featuredBody:
    "Architecture, UX, and front-end as one system — clear hierarchy, fast performance, and ownership from first wireframe to launch.",
  featuredCtaLabel: "Start engagement",
  featuredCtaHref: "/contact" as const,
  featuredImage: "/images/services/website.jpg",
  featuredCategory: "Website Development",
  ctaTitle: "Ready to put your next build in this grid?",
  ctaLede: "Tell us what you are building. We reply with a clear next step.",
  ctaLabel: "Start a scoped engagement",
  ctaHref: "/contact" as const,
} as const;

export const portfolioMarqueeImages = [
  "/images/services/website.jpg",
  "/images/services/software.jpg",
  "/images/services/app.jpg",
  "/images/services/seo.jpg",
  "/images/services/smm.jpg",
  "/images/services/design.jpg",
  "/images/services/security.jpg",
  "/images/services/bugfix.jpg",
  "/images/services/website-b.jpg",
  "/images/services/software-b.jpg",
  "/images/services/app-b.jpg",
  "/images/services/design-b.jpg",
] as const;

export type PortfolioCatalogItem = {
  readonly slug: string;
  readonly title: string;
  readonly img: string;
  readonly leftText: string;
  readonly description: string;
};

export const portfolioProjects: readonly PortfolioCatalogItem[] = [
  {
    slug: "growth-stage-brand-site",
    title: "Growth-stage brand site",
    img: "/images/services/website.jpg",
    leftText: "Website Development",
    description:
      "Architecture, UX, and front-end as one conversion system.",
  },
  {
    slug: "internal-ops-platform",
    title: "Internal ops platform",
    img: "/images/services/software.jpg",
    leftText: "Software Development",
    description: "Workflow-mapped product with maintainable APIs.",
  },
  {
    slug: "retention-first-mobile-app",
    title: "Retention-first mobile app",
    img: "/images/services/app.jpg",
    leftText: "App Development",
    description: "Clear journeys and launch-ready builds.",
  },
  {
    slug: "intent-led-seo-program",
    title: "Intent-led SEO program",
    img: "/images/services/seo.jpg",
    leftText: "SEO",
    description: "Rank where customers already search.",
  },
  {
    slug: "social-growth-system",
    title: "Social growth system",
    img: "/images/services/smm.jpg",
    leftText: "Digital Marketing",
    description: "Attention that turns into action.",
  },
  {
    slug: "premium-brand-identity",
    title: "Premium brand identity",
    img: "/images/services/design.jpg",
    leftText: "Graphic Designing",
    description: "Design that speaks before you do.",
  },
] as const;
