export const site = {
  name: "JZ Enterprises",
  legalName: "JZ Enterprises",
  tagline: "Jump If Zero",
} as const;

export const navLinks = [
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Blog", href: "/blog" },
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
    "We design end-to-end digital systems around your goals — not generic templates.",
  imageSrc: "/images/hero-office.png",
  loginHref: "/dashboard",
} as const;
