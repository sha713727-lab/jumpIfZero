export const serviceNavCategories: readonly {
  readonly title: string;
  readonly href: string;
  readonly slug: string;
  readonly children: readonly {
    readonly title: string;
    readonly href: string;
    readonly slug: string;
  }[];
}[] = [
  {
    title: "Custom Development",
    href: "/services/custom-development",
    slug: "custom-development",
    children: [
      {
        title: "Web Development",
        href: "/services/custom-development/web-development",
        slug: "web-development",
      },
      {
        title: "Mobile App Development",
        href: "/services/custom-development/mobile-app-development",
        slug: "mobile-app-development",
      },
      {
        title: "Custom Software Development",
        href: "/services/custom-development/custom-software-development",
        slug: "custom-software-development",
      },
      {
        title: "Web App Development",
        href: "/services/custom-development/web-app-development",
        slug: "web-app-development",
      },
      {
        title: "E-commerce Development",
        href: "/services/custom-development/ecommerce-development",
        slug: "ecommerce-development",
      },
    ],
  },
  {
    title: "SEO",
    href: "/services/seo",
    slug: "seo",
    children: [
      {
        title: "Technical SEO",
        href: "/services/seo/technical-seo",
        slug: "technical-seo",
      },
      {
        title: "International SEO",
        href: "/services/seo/international-seo",
        slug: "international-seo",
      },
      {
        title: "Local SEO",
        href: "/services/seo/local-seo",
        slug: "local-seo",
      },
      {
        title: "E-commerce SEO",
        href: "/services/seo/ecommerce-seo",
        slug: "ecommerce-seo",
      },
      {
        title: "GEO & AEO",
        href: "/services/seo/geo-aeo",
        slug: "geo-aeo",
      },
    ],
  },
  {
    title: "Digital Marketing",
    href: "/services/digital-marketing",
    slug: "digital-marketing",
    children: [
      {
        title: "PPC Management",
        href: "/services/digital-marketing/ppc-management",
        slug: "ppc-management",
      },
      {
        title: "Social Media Marketing",
        href: "/services/digital-marketing/social-media-marketing",
        slug: "social-media-marketing",
      },
      {
        title: "Content Marketing",
        href: "/services/digital-marketing/content-marketing",
        slug: "content-marketing",
      },
      {
        title: "Email Marketing",
        href: "/services/digital-marketing/email-marketing",
        slug: "email-marketing",
      },
      {
        title: "Conversion Optimization",
        href: "/services/digital-marketing/conversion-optimization",
        slug: "conversion-optimization",
      },
    ],
  },
  {
    title: "Design",
    href: "/services/design",
    slug: "design",
    children: [
      {
        title: "UI/UX Design",
        href: "/services/design/ui-ux-design",
        slug: "ui-ux-design",
      },
      {
        title: "Web Design",
        href: "/services/design/web-design",
        slug: "web-design",
      },
      {
        title: "Graphic Design",
        href: "/services/design/graphic-design",
        slug: "graphic-design",
      },
      {
        title: "Brand Identity Design",
        href: "/services/design/brand-identity-design",
        slug: "brand-identity-design",
      },
    ],
  },
  {
    title: "Cyber Security",
    href: "/services/cyber-security",
    slug: "cyber-security",
    children: [
      {
        title: "Web Application Security",
        href: "/services/cyber-security/web-application-security",
        slug: "web-application-security",
      },
      {
        title: "Vulnerability Assessment",
        href: "/services/cyber-security/vulnerability-assessment",
        slug: "vulnerability-assessment",
      },
      {
        title: "Security Hardening",
        href: "/services/cyber-security/security-hardening",
        slug: "security-hardening",
      },
      {
        title: "Security Monitoring & Maintenance",
        href: "/services/cyber-security/security-monitoring-maintenance",
        slug: "security-monitoring-maintenance",
      },
    ],
  },
] as const;

export type ServiceNavChild = (typeof serviceNavCategories)[number]["children"][number];
export type ServiceNavCategory = (typeof serviceNavCategories)[number];
