export const site = {
  name: "JZ Enterprises",
  legalName: "JZ Enterprises",
  tagline: "Jump If Zero",
  description:
    "JZ Enterprises is a software development company delivering custom software, web development, and mobile apps — plus SEO, marketing, design, and security — built around your goals.",
} as const;

export const navLinks = [
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Insights", href: "/blog" },
  { name: "Contact", href: "/contact" },
  { name: "About", href: "/about" },
] as const;

export const heroCopy = {
  eyebrow: "Welcome To",
  welcome: "Welcome",
  signature: "Creating the digital world",
  headlineLead: "JZ",
  headlineRest: "Enterprises",
  support:
    "Custom software development, web development, and digital growth systems — scoped to how you sell and operate.",
  imageSrc: "/images/hero-office.png",
  loginHref: "/dashboard",
} as const;
