export const portfolioCopy = {
  watermark: "Portfolio",
  heroLead: "Selected work.",
  heroRest: "Proof over promises.",
  heroSupport:
    "Websites, software, apps, and brand systems — built to convert, scale, and hold up in the wild.",
  gridTitle: "Recent engagements",
  gridLede: "Six projects across the growth system.",
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

export type PortfolioGsapProject = {
  readonly title: string;
  readonly img: string;
  readonly link: string;
  readonly leftText: string;
  readonly description: string;
};

export const portfolioProjects: readonly PortfolioGsapProject[] = [
  {
    title: "Conversion website system",
    img: "/images/services/website.jpg",
    link: "/contact",
    leftText: "Website Development",
    description: "A site that sells while the team sleeps.",
  },
  {
    title: "Custom operations platform",
    img: "/images/services/software.jpg",
    link: "/contact",
    leftText: "Software Development",
    description: "Workflow software that fits how the team works.",
  },
  {
    title: "Mobile product launch",
    img: "/images/services/app.jpg",
    link: "/contact",
    leftText: "App Development",
    description: "Useful in the hand. Strong in the market.",
  },
  {
    title: "Intent-led SEO program",
    img: "/images/services/seo.jpg",
    link: "/contact",
    leftText: "SEO",
    description: "Rank where customers already search.",
  },
  {
    title: "Social growth system",
    img: "/images/services/smm.jpg",
    link: "/contact",
    leftText: "Digital Marketing",
    description: "Attention that turns into action.",
  },
  {
    title: "Premium brand identity",
    img: "/images/services/design.jpg",
    link: "/contact",
    leftText: "Graphic Designing",
    description: "Design that speaks before you do.",
  },
] as const;
