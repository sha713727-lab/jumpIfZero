export const teamIntro = {
  watermark: "Team",
  title: "Meet Our Team",
  lines: [
    "The people behind every launch, rebuild, and growth sprint.",
    "Specialists who treat your brand like their own.",
  ],
} as const;

export const teamMembers = [
  {
    name: "Alex Rivera",
    role: "Founder & CEO",
    image: "/images/hero-office.png",
    accent: "brand",
    description:
      "Leads strategy and delivery so every engagement stays owned end to end — from first brief to measurable growth.",
    focus:
      "Sets the engagement frame, owns client outcomes, and keeps strategy, product, and growth moving as one system.",
    highlights: [
      "Scoped engagements with clear ownership",
      "Strategy through launch as one pipeline",
      "Client outcomes before vanity deliverables",
    ],
    socials: [
      { label: "LinkedIn", href: "#", network: "linkedin" },
      { label: "Instagram", href: "#", network: "instagram" },
      { label: "X", href: "#", network: "x" },
    ],
  },
  {
    name: "Jordan Blake",
    role: "Creative Director",
    image: "/images/hero-team.png",
    accent: "secondary",
    description:
      "Shapes brand systems and visual identity with clarity and impact — so the product looks as sharp as it performs.",
    focus:
      "Builds premium visual systems — identity, campaign language, and product UI that hold together across every touchpoint.",
    highlights: [
      "Brand systems with lasting consistency",
      "Conversion-aware creative direction",
      "Assets ready for web, product, and social",
    ],
    socials: [
      { label: "LinkedIn", href: "#", network: "linkedin" },
      { label: "Instagram", href: "#", network: "instagram" },
      { label: "X", href: "#", network: "x" },
    ],
  },
  {
    name: "Sam Chen",
    role: "Head of Growth",
    image: "/images/welcome-hero.png",
    accent: "dark",
    description:
      "Builds acquisition and retention systems that turn attention into pipeline — SEO, social, and conversion in one loop.",
    focus:
      "Connects traffic, content, and conversion so attention becomes measurable pipeline — not vanity metrics.",
    highlights: [
      "Intent-led SEO and content systems",
      "Social loops that drive action",
      "Reporting tied to leads and growth",
    ],
    socials: [
      { label: "LinkedIn", href: "#", network: "linkedin" },
      { label: "Instagram", href: "#", network: "instagram" },
      { label: "X", href: "#", network: "x" },
    ],
  },
] as const;

export type TeamMember = (typeof teamMembers)[number];
export type TeamSocialNetwork = TeamMember["socials"][number]["network"];
