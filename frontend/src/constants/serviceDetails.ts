export type ServiceDetail = {
  readonly slug: string;
  readonly category: string;
  readonly title: string;
  readonly quote: string;
  readonly body: string;
  readonly highlights: readonly [string, string, string];
  readonly image: string;
  readonly ctaLabel: string;
  readonly ctaHref: "/contact";
};

export const serviceDetails: readonly ServiceDetail[] = [
  {
    slug: "website-development",
    category: "Website Development",
    title: "Websites engineered to convert visitors into customers.",
    quote: "A website should sell while you sleep.",
    body: "We design and build conversion-first sites — clear hierarchy, fast performance, and ownership from first wireframe to launch. No template fog. Every page earns its place in the funnel.",
    highlights: [
      "Architecture, UX, and front-end as one system",
      "Speed, SEO foundations, and conversion paths",
      "Handoff you can grow without rebuilding later",
    ],
    image: "/images/services/website.jpg",
    ctaLabel: "Start engagement",
    ctaHref: "/contact",
  },
  {
    slug: "software-development",
    category: "Software Development",
    title: "Custom software that fits your workflow — not the other way around.",
    quote: "Build once. Scale with confidence.",
    body: "Internal tools, platforms, and product systems shaped around how your team actually works. Clean architecture, clear ownership, and room to scale without brittle shortcuts.",
    highlights: [
      "Workflow-mapped product design",
      "Reliable APIs and maintainable codebases",
      "Roadmaps that survive the next release",
    ],
    image: "/images/services/software.jpg",
    ctaLabel: "Start engagement",
    ctaHref: "/contact",
  },
  {
    slug: "app-development",
    category: "App Development",
    title: "Mobile apps built for speed, clarity, and growth.",
    quote: "Useful in the hand. Strong in the market.",
    body: "Apps that feel intentional — fast loads, clear journeys, and product decisions tied to retention. From MVP to polished release, we keep the experience sharp.",
    highlights: [
      "iOS and Android product craft",
      "UX that reduces friction on every screen",
      "Launch-ready builds with room to iterate",
    ],
    image: "/images/services/app.jpg",
    ctaLabel: "Start engagement",
    ctaHref: "/contact",
  },
  {
    slug: "seo",
    category: "SEO",
    title: "SEO that targets intent, not vanity keywords.",
    quote: "Rank where your customers already search.",
    body: "Technical foundations, content structure, and intent-led targeting so search traffic becomes pipeline — not a vanity chart. We measure what moves the business.",
    highlights: [
      "Technical audits and site health",
      "Intent mapping and content systems",
      "Reporting tied to leads and revenue paths",
    ],
    image: "/images/services/seo.jpg",
    ctaLabel: "Start engagement",
    ctaHref: "/contact",
  },
  {
    slug: "digital-marketing",
    category: "Digital Marketing",
    title: "Social content that earns attention and drives action.",
    quote: "Consistency builds the brand people remember.",
    body: "Campaigns and content systems that keep your brand present — with creative that earns attention and CTAs that turn views into conversations worth having.",
    highlights: [
      "Channel strategy and content calendars",
      "Creative that matches premium brand tone",
      "Loops from attention to measurable action",
    ],
    image: "/images/services/smm.jpg",
    ctaLabel: "Start engagement",
    ctaHref: "/contact",
  },
  {
    slug: "graphic-designing",
    category: "Graphic Designing",
    title: "Visual identity that feels premium and consistent.",
    quote: "Design that speaks before you do.",
    body: "Brand systems, campaign visuals, and assets that hold together across every touchpoint. Premium presence without visual noise.",
    highlights: [
      "Identity systems and brand kits",
      "Campaign and product visual language",
      "Assets ready for web, print, and social",
    ],
    image: "/images/services/design.jpg",
    ctaLabel: "Start engagement",
    ctaHref: "/contact",
  },
  {
    slug: "network-security",
    category: "Network Security",
    title: "Security systems that reduce risk without slowing work.",
    quote: "Protect the business behind the brand.",
    body: "Hardening, monitoring, and practical controls that protect operations without burying your team in friction. Security that supports growth.",
    highlights: [
      "Risk assessment and hardening plans",
      "Access, network, and endpoint controls",
      "Ongoing monitoring with clear ownership",
    ],
    image: "/images/services/security.jpg",
    ctaLabel: "Start engagement",
    ctaHref: "/contact",
  },
  {
    slug: "fix-bug-error",
    category: "Fix Bug & Error",
    title: "Diagnose. Fix. Stabilize — before issues cost you more.",
    quote: "Fast fixes. Stable systems. Less downtime.",
    body: "When production breaks, speed and judgment matter. We diagnose root causes, ship durable fixes, and leave the system more stable than we found it.",
    highlights: [
      "Rapid triage and root-cause diagnosis",
      "Durable patches — not temporary patches",
      "Stabilization notes your team can own",
    ],
    image: "/images/services/bugfix.jpg",
    ctaLabel: "Start engagement",
    ctaHref: "/contact",
  },
] as const;

export function getServiceDetailBySlug(
  slug: string,
): ServiceDetail | undefined {
  return serviceDetails.find((item) => item.slug === slug);
}

export function getServiceDetail(
  category: string,
): ServiceDetail | undefined {
  return serviceDetails.find((item) => item.category === category);
}
