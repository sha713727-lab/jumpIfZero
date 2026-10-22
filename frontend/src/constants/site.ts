export const site = {
  name: "JZ Enterprises",
  legalName: "JZ Enterprises",
  tagline: "Jump If Zero",
  description:
    "JZ Enterprises is a custom software, web, and mobile app development company in Lahore, Pakistan — with SEO, marketing, design, and security as supporting capabilities.",
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
    "Custom software, web, and mobile app development for growing businesses in Lahore and across Pakistan.",
  imageSrc: "/images/hero-office.png",
  loginHref: "/dashboard",
} as const;
