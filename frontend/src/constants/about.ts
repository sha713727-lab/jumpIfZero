export const aboutCopy = {
  watermark: "About",
  title: "JZ Enterprises",
  lede: "End-to-end digital systems around your goals — not generic templates.",
  micro: "Jump If Zero · strategy, design, development, growth",
  storyTitle: "Who we are",
  story: [
    "Our goal is to create holistic IT solutions tailored to your needs while attracting the ideal target audience to improve the reach of your online business.",
    "We design end-to-end digital systems around your goals — not generic templates. From strategy to launch, we build products that attract the right audience and turn attention into measurable growth.",
    "Technical excellence. Clear communication. Outcomes you can scale. That is how Jump If Zero works.",
  ],
  principlesTitle: "How we work",
  principlesLede: "Three standards on every engagement.",
  principles: [
    {
      index: "01",
      title: "One system, not scattered vendors",
      body: "Strategy, design, development, and growth run as one owned pipeline — so launches stay sharp and rebuilds stay coherent.",
      accent: "brand",
      image: "/images/services/software.jpg",
      imageAlt: "Software systems work",
    },
    {
      index: "02",
      title: "Built for conversion",
      body: "Every surface is shaped to attract the right audience and turn attention into measurable growth — not vanity deliverables.",
      accent: "secondary",
      image: "/images/services/website.jpg",
      imageAlt: "Website conversion work",
    },
    {
      index: "03",
      title: "Clear ownership",
      body: "Direct process language, defined scope, and outcomes you can scale. No agency fog.",
      accent: "brand",
      image: "/images/hero-team.png",
      imageAlt: "JZ Enterprises team collaboration",
    },
  ],
  locationTitle: "Where to find us",
  locationWatermark: "Location",
  location: {
    label: "Studio",
    emailLabel: "Email",
    phoneLabel: "Phone",
    ctaLabel: "Start a scoped engagement",
    ctaHref: "/contact",
  },
  ctaTitle: "Ready to scope the next build?",
  ctaLede: "Tell us what you are building. We reply with a clear next step.",
  ctaLabel: "Start a scoped engagement",
  ctaHref: "/contact",
} as const;

export type AboutPrincipleAccent =
  (typeof aboutCopy.principles)[number]["accent"];
