export const site = {
  name: "JZ Enterprises",
  legalName: "JZ Enterprises",
  tagline: "Jump If Zero",
} as const;

export const navLinks = [
  { name: "About Us", href: "/#about" },
  { name: "Our Services", href: "/#services" },
  { name: "Contact", href: "/#contact" },
  { name: "Portfolio", href: "/#services" },
  { name: "Blog", href: "/" },
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
  loginHref: "/login",
} as const;
