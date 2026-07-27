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
    socials: [
      { label: "LinkedIn", href: "#", network: "linkedin" },
      { label: "Instagram", href: "#", network: "instagram" },
      { label: "X", href: "#", network: "x" },
    ],
  },
] as const;

export type TeamSocialNetwork = (typeof teamMembers)[number]["socials"][number]["network"];
